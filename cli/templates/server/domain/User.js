const _ = require("lodash");
const util = require("util");
var Domain = require("micro-framework/api/_domain");
function User(obj,skipFields){
    var self = this;
    Domain.call(this,{fields:obj,clazz:"User",refClazz:self,domain:"users",skipFields:skipFields});
}

Domain.inherits(User);
User.domain = "users";
User.prototype._domainFields = [
    {name:"id"},
    {name:"user", validate:["nullable"]},
    {name:"pass",type:"password", validate:["nullable"]},
    {name:"name"},
    {name:"email"},
    {name:"atived"},
    {name:"disabled"},
    {name:'birth',type:"timestamp"},
    {name:'gender'},
    {name:'phone', type:"number"},
    {name:"address"},
    {name:'authProvider'},
    {name:"avatar"}
];

User.prototype.validate = function(){
    var self = this;
    var valid = Domain.prototype.validate.call(self);
    function closureValidate(field){
        if(util.isNullOrUndefined(self[field])){
            valid = false;
            self.errors.push(field.toUpperCase()+" cannot be null ");
        }
    }
    if(self.atived){
        var fieldsCheck = ["name","email","birth","gender","phone","address"];
        _.each(fieldsCheck,closureValidate);   
    }
    return valid;
};

User.initializeCache();

module.exports = User;