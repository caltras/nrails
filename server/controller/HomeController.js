var HomeController = (function() {
    return {
        "services":["AuthenticationService"],
        "authenticate": false,
        "authenticateAll": false,
        "get": {
            "/":function(req,res){
                HomeController.authenticationService.welcome()
                .then(function(data){
                    res.send(data);    
                },function(error){
                    res.send("Error");
                });
            }
        }
    };
})();
module.exports = HomeController;