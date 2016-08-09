var fs = require("fs");
var path = (process.env.PWD || process.cwd()).split("/node_modules")[0];
var ncp = require("ncp").ncp;

function createPackage(p,a) {
    if (!fs.existsSync(p + "/package.json")) {
        console.log(path);
        var project = a[0] || path.substring(path.lastIndexOf("/")+1);
        var template =
            `
{
  "name": "${project}",
  "version": "0.0.1",
  "description": "${project}",
  "main": "server.js",
  "author": {
    "name": "",
    "email": ""
  },
  "keywords": [
    "nrails",
    "mvc",
    "express",
    "elasticsearch",
    "NeDB",
    "firebase"
  ],
  "dependencies": {
    "body-parser": "^1.15.0",
    "connect-ensure-login": "^0.1.1",
    "connect-flash": "^0.1.1",
    "cookie-parser": "^1.4.1",
    "crypt": "0.0.1",
    "ejs": "~0.8.5",
    "elasticsearch": "^10.1.3",
    "express": "~3.2.4",
    "express-session": "^1.13.0",
    "firebase": "^2.4.2",
    "firebase-token-generator": "^2.0.0",
    "glob": "^7.0.3",
    "lodash": "^4.5.0",
    "moment": "^2.13.0",
    "moment-timezone": "^0.5.4",
    "nedb": "^1.8.0",
    "nodemailer": "^2.3.0",
    "nrails": "git://github.com/caltras/nrails.git#master"
    "passport": "^0.3.2",
    "passport-facebook": "^2.1.0",
    "passport-google": "^0.3.0",
    "passport-google-oauth": "^1.0.0",
    "passport-http": "^0.3.0",
    "passport-local": "^1.0.0"
  },
  "devDependencies": {
    "chai": "^3.5.0",
    "istanbul": "^0.4.4",
    "mocha": "^2.5.3",
    "sinon": "^1.17.5"
  }
}`;
        fs.writeFileSync(path + "/package.json", template, "UTF-8");
    }
}

function createClient(p) {
    if (!fs.existsSync(p + "/client")) {
        ncp(__dirname + "/templates/client", p + "/client", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}

function createServerApp(p) {
    if (!fs.existsSync(p + "/server")) {
        ncp(__dirname + "/templates/server", p + "/server", function(err) {
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

function createServerFile(p) {
    if (!fs.existsSync(p + "/server.js")) {
        ncp(__dirname + "/templates/server.js", p + "/server.js", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}
module.exports = function(args) {
    console.log("Initializing application...");
    createPackage(path,args);
    createClient(path);
    createServerApp(path);
    createTestFolder(path);
    createServerFile(path);
    console.log("Init done...");
};