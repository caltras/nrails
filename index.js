var path = require('path');
global.module_directory = path.resolve(__filename).replace("/index.js","");

module.exports = require("./main");