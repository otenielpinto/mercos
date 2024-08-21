require("dotenv-safe").config();
const TMongo = require("./infra/mongoClient");
const app = require("./app");
const agenda = require("./agenda");

(async () => {
  console.log("system", `Starting the server apps...`);
  const server = app.listen(process.env.NODE_PORT, () => {
    console.log("system", "App is running at " + process.env.NODE_PORT);
    console.log("system", `Starting the Agenda...`);
    agenda.init();
  });
})();
