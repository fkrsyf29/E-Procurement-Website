using EProcurement.Api.Models.Config;
using EProcurement.Api.Models.Responses;
using EProcurement.Api.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Text;
using System.Xml;

namespace EProcurement.Api.Services.Implementations
{
    public class SsoService : ISsoService
    {
        private readonly SoapConfig _config;
        private readonly HttpClient _client;

        public SsoService(IOptions<SoapConfig> config)
        {
            _config = config.Value;
            _client = new HttpClient();
        }

        public async Task<bool> AuthenticateUser(string username, string password)
        {

string soapEnvelope = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance""
               xmlns:xsd=""http://www.w3.org/2001/XMLSchema""
               xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Header>
    <AppCredentials xmlns=""http://tempuri.org/"">
      <AppCode>{_config.AppCode}</AppCode>
      <AppKey>{_config.AppKey}</AppKey>
    </AppCredentials>
  </soap:Header>
  <soap:Body>
    <AuthenticateUser xmlns=""http://tempuri.org/"">
      <UserID>{username}</UserID>
      <Password>{password}</Password>
    </AuthenticateUser>
  </soap:Body>
</soap:Envelope>";

            var content = new StringContent(soapEnvelope, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", "\"http://tempuri.org/AuthenticateUser\"");

            var response = await _client.PostAsync(_config.Address, content);
            var xml = await response.Content.ReadAsStringAsync();

            return xml.Contains("<AuthenticateUserResult>true</AuthenticateUserResult>");
        }

        public async Task<UserInfoDto?> GetUserInfo(string username)
        {
string soapEnvelope = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance""
               xmlns:xsd=""http://www.w3.org/2001/XMLSchema""
               xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Header>
    <AppCredentials xmlns=""http://tempuri.org/"">
      <AppCode>{_config.AppCode}</AppCode>
      <AppKey>{_config.AppKey}</AppKey>
    </AppCredentials>
  </soap:Header>
  <soap:Body>
    <GetUserInfo xmlns=""http://tempuri.org/"">
      <UserID>{username}</UserID>
    </GetUserInfo>
  </soap:Body>
</soap:Envelope>";

            var content = new StringContent(soapEnvelope, Encoding.UTF8, "text/xml");
            content.Headers.Add("SOAPAction", "\"http://tempuri.org/GetUserInfo\"");

            var response = await _client.PostAsync(_config.Address, content);
            var xml = await response.Content.ReadAsStringAsync();

            var doc = new XmlDocument();
            doc.LoadXml(xml);

            var nrp = doc.GetElementsByTagName("NRP")?[0]?.InnerText;
            var name = doc.GetElementsByTagName("FullName")?[0]?.InnerText;
            var email = doc.GetElementsByTagName("UserEmail")?[0]?.InnerText;

            if (nrp == null)
                return null;

            return new UserInfoDto
            {
                NRP = nrp,
                FullName = name,
                UserEmail = email
            };
        }

        public async Task<bool> Ping()
        {
            try
            {
                string soapEnvelope = $@"<?xml version=""1.0"" encoding=""utf-8""?>
<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance""
               xmlns:xsd=""http://www.w3.org/2001/XMLSchema""
               xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">
  <soap:Header>
    <AppCredentials xmlns=""http://tempuri.org/"">
      <AppCode>{_config.AppCode}</AppCode>
      <AppKey>{_config.AppKey}</AppKey>
    </AppCredentials>
  </soap:Header>
  <soap:Body>
    <AuthenticateUser xmlns=""http://tempuri.org/"">
      <UserID>ping_test</UserID>
      <Password>dummy</Password>
    </AuthenticateUser>
  </soap:Body>
</soap:Envelope>";

                var content = new StringContent(soapEnvelope, Encoding.UTF8, "text/xml");
                content.Headers.Add("SOAPAction", "\"http://tempuri.org/AuthenticateUser\"");

                var response = await _client.PostAsync(_config.Address, content);

                // selama server memberi respons SOAP valid = service hidup
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

    }
}
