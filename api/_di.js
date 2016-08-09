module.exports = {
    $inject : function(path,rootPath) {
        var getUrl = function(path,rootPath){
            var url = path;
            if(path.toLowerCase().indexOf("service") > -1){
                url = path.replace("service/","").replace(".js","");
                url = (rootPath ? rootPath : "")+"service/"+url;
            }else{
                if(path.toLowerCase().indexOf("controller") > -1){
                    url = path.replace("controller/","").replace(".js","");
                    url = (rootPath ? rootPath : "")+"controller/"+url;
                }else{
                    throw new Error("Canno't inject dependecie. Type not defined. ", path);
                }
            }
            return url;
        };
        if(path){
            var urlDependency = getUrl(path,rootPath);
            return require(urlDependency);
        }else{
            throw new Error("Canno't inject dependecie. ", path);
        }
    }
};