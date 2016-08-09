const _ = require("lodash");
var path = (process.env.PWD || process.cwd()).split("/node_modules")[0];;
var fs = require("fs");
String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
};
module.exports = function(args) {
    console.log("Create domain script");
    if (args.length == 0) {
        console.log("Not found name to domain");
        return;
    }
    _.each(args, function(domain) {
        var capitalizeDomain = domain.capitalize();
        var lowerCaseDomain = domain.toLowerCase();
        if (!fs.existsSync(path + "/server/domain/" + capitalizeDomain + ".js")) {

            var template = `//Auto-generated ${new Date()}
var Domain = require("micro-framework/api/_domain");
function ${capitalizeDomain}(obj,skipFields){
    var self = this;
    Domain.call(this,{fields:obj,clazz:"${capitalizeDomain}",refClazz:self,domain:"${lowerCaseDomain}",skipFields:skipFields});
}

Domain.inherits(${capitalizeDomain});
${capitalizeDomain}.domain = "${lowerCaseDomain}";
${capitalizeDomain}.prototype._domainFields = [{}];

${capitalizeDomain}.initializeCache();

${capitalizeDomain}.prototype.validate = function(){
    var self = this;
    var valid = Domain.prototype.validate.call(self);
    return valid;
};

module.exports = ${capitalizeDomain};`;
            fs.writeFileSync(path + "/server/domain/" + capitalizeDomain + ".js", template, "UTF-8");
            console.log(path + "/server/domain/" + capitalizeDomain + ".js Created");
        }
    });
};