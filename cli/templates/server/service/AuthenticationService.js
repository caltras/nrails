var User = require("../domain/User");
var AuthenticationService = {
    welcome : function(){
        return new Promise(function(resolve,reject){
           resolve("Welcome!") ;
        });
    }
};
module.exports =  AuthenticationService;