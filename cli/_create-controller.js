const _ = require("lodash");
var path = (process.env.PWD || process.cwd()).split("/node_modules");
var fs = require("fs");
String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
};
module.exports = function(args) {
    console.log("Create controller script");
    if (args.length == 0) {
        console.log("Not found name to controller");
        return;
    }
    _.each(args, function(controller) {
        var capitalizeController = controller.capitalize().replace(/Controller/gi,"");
        if (!fs.existsSync(path + "/server/domain/" + capitalizeController + "Controller.js")) {

            var template = 
`var ${capitalizeController}Controller = (function() {
    return {
        "services":[],
        "authenticate": false,
        "authenticateAll": false,
        "get": {
            "/":function(req,res){
                res.send("GET ${capitalizeController} Controller");
            }
        },
        "post": {
            "/":function(req,res){
                res.send("POST ${capitalizeController} Controller");
            }
        },
        "put": {
            "/":function(req,res){
                res.send("PUT ${capitalizeController} Controller");
            }
        },
        "delete": {
            "/":function(req,res){
                res.send("DELETE ${capitalizeController} Controller");
            }
        }
    };
})();
module.exports = ${capitalizeController}Controller;`;
            fs.writeFileSync(path + "/server/controller/" + capitalizeController + "Controller.js", template, "UTF-8");
            console.log(path + "/server/controller/" + capitalizeController + "Controller.js Created");
        }
    });
};