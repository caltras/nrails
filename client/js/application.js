var application=null;
(function(angular){
    "use strict";
    application = angular.module("nrails",["ngRoute","ngMaterial"]);
    
    application.constant("CONSTANTS",
        {
            "URL_BASE": window.location.href
        });
    application.run(["$rootScope",function($rootScope){
        $rootScope.$on("$routeChangeSuccess", function(currentRoute, previousRoute){
            $rootScope.title = currentRoute.current.title;
        });
    }]);
    application.config(function($routeProvider){
        $routeProvider.when("/",{
            templateUrl: function(params){
                return "/index";
            },
            title : "NRails"
        })
        .otherwise({
            templateUrl: function(params){
                return "/404";
            },
            title : "NRails"
        });
    });
    
    
})(angular);

angular.element(document).ready(function(){
	angular.bootstrap(document,['nrails']);
});