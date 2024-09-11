//import { Service } from "node-windows";
var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "Mercos Service",
  description: "Service API HTTP Win32 NodeJS",
  script: "C:\\www\\public\\mercos\\src\\server.js",
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("uninstall", function () {
  console.log("Uninstalling service...");
});

svc.uninstall();
