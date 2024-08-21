const axios = require("axios");
const { response } = require("../app");
const base_url = "https://sandbox.mercos.com/api/";

const MERCOS_APPLICATION_TOKEN = String(process.env.MERCOS_APPLICATION_TOKEN);
const MERCOS_COMPANY_TOKEN = String(process.env.MERCOS_COMPANY_TOKEN);

module.exports = async (apiUrl, data = {}, method = "GET") => {
  try {
    const response = await axios({
      method,
      url: `${base_url}${apiUrl}`,
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
