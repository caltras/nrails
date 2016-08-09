const config = require("nrails/config/config");

var LoginController = {
    "get" : {
        "/": function(req, res){
            if(req.user){
                res.redirect(config.login.successRedirect);
            }else{
                res.render("site/login.html");
            }
        },
    }
};

module.exports = LoginController;