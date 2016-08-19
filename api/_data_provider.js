
var Cache = require("../api/_cache");
const _ = require("lodash");

function Provider(ds, domain) {
    ds = ds ? ds : "default";
    this.dataSource = ds;
    this.domain = domain;
    this.instance = null;
    this.config = global.app_config;
    return this;
}
Provider.path = "../data/";
Provider.config = global.app_config;
Provider.require = function(){
    if(Provider.path && this.config && this.config.dataProvider){
        return require(Provider.path + this.config.dataProvider);
    }else{
        throw Error("Configuration not found.");
    }
};
Provider.hasCache = function(nocache){
    return Provider.config.cache && Provider.config.cache.enabled && !nocache;
};
Provider.prototype.getInstance = function() {
    var self = this;
    if (!this.instance) {
        var p = Provider.require();
        this.instance = p.getInstance(self.dataSource);
    }
    return this.instance;
};
Provider.prototype.getTimestamp = function() {
    return Provider.require().getTimestamp();
};
Provider.prototype.save = function(obj) {
    var self = this;
    var d = Provider.require();
    return d.save(self.dataSource, self.domain, obj);
};
Provider.prototype.updateField = function(id,field) {
    var self = this;
    var d = Provider.require();
    return d.set(field,null,self.dataSource,self.domain,id);
};
Provider.prototype.delete = function(key,callback,fail) {
    var self = this;
    var d = Provider.require();
    return d.delete(self.dataSource, self.domain, key,callback,fail);
};
Provider.prototype.getTableReference = function() {
    var self = this;
    var d = Provider.require();
    return d.getTableReference(self.dataSource, self.domain);
};
Provider.findById = function(ds, domain, id, callback, fail,nocache) {
    if (Provider.hasCache(nocache)) {
        return Cache.findById("domains", domain, id, callback, fail);
    }
    else {
        if(this.config.database.inMemory && !nocache){
            var promise = global.memDB.findOne({id:id},domain);
            if(callback){
                promise.then(function(data){
                    callback.call(this,data);
                },function(error){
                    if(fail){
                        fail.call(error);
                    }
                });
            }else{
                return promise;
            }
        }else{
            var module = Provider.require();
            return module.findById(ds, domain, id, function(snapshot) {
                 callback.call(this, snapshot);
            }, fail);
        }
    }
};
Provider.find = function(ds, domain, criterias, callback, fail, nocache) {
    if (Provider.hasCache(nocache)) {
        return Cache.query("domains", domain, criterias, callback, fail);
    }
    else {
        criterias = criterias || {};
        if(this.config.database.inMemory && !nocache){
            var promise = global.memDB.find(criterias,domain);
            if(callback){
                promise.then(function(data){
                    callback.call(this,data);
                },function(error){
                    if(fail){
                        fail.call(error);
                    }
                });
            }else{
                return promise;
            }
        }else{
            var module = Provider.require();
            return module.find(ds, domain, criterias, function(snapshot) {
                callback.call(this, snapshot);
            }, fail);
        }
    }
};
Provider.count = function(ds,domain,criteria,callback,fail,nocache){
    if (Provider.hasCache(nocache)) {
        return Cache.count("domains", domain,criteria, callback, fail);
    }
    else {
        criteria = criteria || {};
        if(this.config.database.inMemory && !nocache){
            var promise = global.memDB.count(criteria,domain);
            if(callback){
                promise.then(function(data){
                    callback.call(this,data);
                },function(error){
                    if(fail){
                        fail.call(error);
                    }
                });
            }else{
                return promise;
            }
        }else{
            var module = Provider.require();
            return module.count(ds, domain, criteria, function(current_size){
               callback.call(this,current_size);
            });
        }
    }
};

module.exports = Provider;
