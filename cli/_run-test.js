const exec = require('child_process').exec;
const path = (process.env.PWD || process.cwd()).split("/node_modules")[0];
var testString = "npm test";
const os = require("os");
var OS_PERMISSION = {
    win32 : "",
    linux: "sudo ",
    darwin:"",
    freebsd:"",
    sunos:""
};
module.exports = function(parameters,config){
    console.log("Run unit test...");
    exec(OS_PERMISSION[os.platform()]+testString, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(stdout);
      console.log("Finalizing unit test");
    });
};