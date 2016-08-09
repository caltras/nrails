var fs = require("fs");
var path = (process.env.PWD || process.cwd()).split("/node_modules");
var ncp = require("ncp").ncp;

function createClient(p) {
    if (!fs.existsSync(p + "/client")) {
        ncp(__dirname+"/templates/client", p + "/client", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}
function createServerApp(p) {
   if (!fs.existsSync(p + "/server")) {
        ncp(__dirname+"/templates/server", p + "/server", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}

function createTestFolder(p) {
    fs.existsSync(p + "/test") || fs.mkdirSync(p + "/test");
    return p + "/test";
}
function createServerFile(p){
    if(!fs.existsSync(p+"/server.js")){
        ncp(__dirname+"/templates/server.js", p+"/server.js", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}
module.exports = function(args) {
    console.log("Initializing application...");
    createClient(path);
    createServerApp(path);
    createTestFolder(path);
    createServerFile(path);
    console.log("Init done...");
};