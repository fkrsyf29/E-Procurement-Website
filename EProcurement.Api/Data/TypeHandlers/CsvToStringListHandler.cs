using Dapper;
using System.Data;

namespace EProcurement.Api.Data.TypeHandlers
{
    public class CsvToStringListHandler : SqlMapper.TypeHandler<List<string>>
    {
        public override void SetValue(IDbDataParameter parameter, List<string> value)
        {
            parameter.Value = value == null ? null : string.Join(",", value);
        }

        public override List<string> Parse(object value)
        {
            if (value == null || value == DBNull.Value)
                return new List<string>();

            return value.ToString()
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(v => v.Trim())
                .ToList();
        }
    }
}
