const _ = require("lodash");
var glob = require("glob");

var taglib= {
    angular_js: function(angularVersion) {
        angularVersion = angularVersion || "1.4.8";
        return '<!-- Angular Material requires Angular.js Libraries -->\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular.min.js"></script>\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular-sanitize.min.js"></script>\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular-route.min.js"></script>\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular-animate.min.js"></script>\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular-aria.min.js"></script>\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/' + angularVersion + '/angular-messages.min.js"></script>\n';
    },
    angular_material_css: function(materialVersion) {
        materialVersion = materialVersion || "1.0.0";
        return '<!-- Angular Material style sheet -->\n' +
            '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">\n' +
            '<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/' + materialVersion + '/angular-material.min.css">\n';
    },
    angular_material_js: function(materialVersion) {
        materialVersion = materialVersion || "1.0.0";
        return '<!-- Angular Material Library -->\n' +
            '<script src="https://ajax.googleapis.com/ajax/libs/angular_material/' + materialVersion + '/angular-material.min.js"></script>\n';
    },
    application: function(paths) {
        var retorno = '<script src="/js/app/app.js"></script>\n' +
            '<script src="/js/app/controllers.js"></script>\n' +
            '<script src="/js/app/services.js"></script>\n' +
            '<script src="/js/app/directives.js"></script>\n';
        
        retorno+=taglib.loadPaths(paths);
        
        return retorno;
    },
    loadPaths : function(paths){
        var retorno ="";
        if (paths) {
            _.each(paths, function(v, k) {
                // options is optional
                var files = glob.sync("./client/"+v);
                _.each(files,function(fileName){
                    retorno += '<script src="'+fileName.replace("./client","")+'"></script>\n';
                });
            });
        }
        return retorno;
    },
    c3:function(type){
        if(type==="js"){
            var retorno = '<script src="/resources/plugins/c3-angular-directive/js/d3.min.js"></script>\n' +
                        '<script src="/resources/plugins/c3-angular-directive/js/c3.min.js"></script>\n' +
                        '<script src="/resources/plugins/c3-angular-directive/js/c3-angular.min.js"></script>\n';
            return retorno;
        }else{
            if(type==="css"){
                return '<link href="/resources/plugins/c3-angular-directive/css/c3.min.css" rel="stylesheet">';
            }
        }
        return "";
    }
};
module.exports = taglib;