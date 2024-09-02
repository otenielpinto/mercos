const axios = require("axios");

const MERCOS_APPLICATION_TOKEN = String(process.env.MERCOS_APPLICATION_TOKEN);
const MERCOS_COMPANY_TOKEN = String(process.env.MERCOS_COMPANY_TOKEN);
const BASE_URL = String(process.env.MERCOS_BASE_URL);

module.exports = async (apiUrl, data = {}, method = "GET") => {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${apiUrl}`,
      headers: {
        "Content-Type": "application/json",
        ApplicationToken: MERCOS_APPLICATION_TOKEN,
        CompanyToken: MERCOS_COMPANY_TOKEN,
      },
      data: data,
    });

    return response;
  } catch (error) {
    //console.log(error);
    return error;
  }
};
