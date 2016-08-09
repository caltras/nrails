(function(application){
    "use strict";
    
    var RootController = function($rootScope,$scope){
        $rootScope.titleApp = "NRails";        
    };
    
    RootController.$inject = ['$rootScope','$scope'];
    application.controller("rootCtrl", RootController);
    
})(application);