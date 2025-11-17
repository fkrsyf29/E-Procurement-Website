using Dapper;
using System.Data;

namespace EProcurement.Api.Data.TypeHandlers
{
    public class CsvToIntListHandler : SqlMapper.TypeHandler<List<int>>
    {
        public override void SetValue(IDbDataParameter parameter, List<int> value)
        {
            parameter.Value = value == null ? null : string.Join(",", value);
        }

        public override List<int> Parse(object value)
        {
            if (value == null || value == DBNull.Value)
                return new List<int>();

            return value.ToString()
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(v => int.Parse(v.Trim()))
                .ToList();
        }
    }
}
