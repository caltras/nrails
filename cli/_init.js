var fs = require("fs");
const util = require('util');
var path = (process.env.PWD || process.cwd()).split("/node_modules")[0];
console.log(path);
const SEPARATOR = require("path").sep;
console.log(SEPARATOR);
var ncp = require("ncp").ncp;
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const os = require("os");

function createPackage(p,a) {
    var project = a[0] || path.substring(path.lastIndexOf(SEPARATOR)+1);
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
    "nrails": "git://github.com/caltras/nrails.git#master",
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
    if (!fs.existsSync(p + SEPARATOR+"package.json")) {
        fs.writeFileSync(path + SEPARATOR+"package.json", template, "UTF-8");
    }
}

function createClient(p) {
    if (!fs.existsSync(p + SEPARATOR+"client")) {
        ncp(__dirname + SEPARATOR+"templates"+SEPARATOR+"client", p + SEPARATOR+"client", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}

function createServerApp(p) {
    if (!fs.existsSync(p + SEPARATOR+"server")) {
        ncp(__dirname + SEPARATOR+"templates"+SEPARATOR+"server", p + SEPARATOR+"server", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}

function createTestFolder(p) {
    fs.existsSync(p + SEPARATOR+"test") || fs.mkdirSync(p + SEPARATOR+"test");
    return p + SEPARATOR+"test";
}

function createServerFile(p) {
    if (!fs.existsSync(p + SEPARATOR+"server.js")) {
        ncp(__dirname + SEPARATOR+"templates"+SEPARATOR+"server.js", p + SEPARATOR+"server.js", function(err) {
            if (err) {
                throw err;
            }
        });
    }
}
var OS_PERMISSION = {
    win32 : "",
    linux: "sudo ",
    darwin:"",
    freebsd:"",
    sunos:""
};
function npmInstall(p){
    /*var exec = spawn(OS_PERMISSION[os.platform()]+"npm", ["install"]);
    
    exec.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    exec.stderr.on('data', (data) => {
        console.log(`${data}`);
    });

    exec.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });*/
    console.log("Installing packages...waiting..");
    exec(OS_PERMISSION[os.platform()]+"npm install", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log("Finished");
    });
}
module.exports = function(args) {
    console.log("Initializing application...");
    createPackage(path,args);
    createClient(path);
    createServerApp(path);
    createTestFolder(path);
    createServerFile(path);
    npmInstall(path);
    console.log("Init done...");
};