const util = require("util");
const config = global.app_config || require("../config/config");
const _ = require("lodash");
var ElasticsearchBuilder = require("./_elastic_query_builder");
const miscellaneous = require("../utils/Miscellaneous" );

function Cache() {

}
Cache.getInstance = function() {
    if (!Cache.instance) {
        var elasticsearch = require('elasticsearch');
        Cache.instance = new elasticsearch.Client({
            host: config.elasticsearch.url,
            log: config.elasticsearch.log
        });
    }
    return Cache.instance;
};
Cache.save = function(index, domain, snapshot) {
    return new Promise(function(resolve,reject){
        Cache.getInstance().index({
            index: index,
            type: domain,
            id: snapshot.key(),
            body: snapshot.val()
        }, function(err, response) {
            if (err) {
                reject(new Error("Error indexing user : " + err));
                return;
            }
            resolve(true);
            return;
        });
    });
};
Cache.delete = function(index, domain, snapshot) {
    return new Promise(function(resolve,reject){
        Cache.getInstance().delete({
            index: index,
            type: domain,
            id: snapshot.key()
        }, function(error, response) {
            if (error) {
                reject( new Error("Error deleting user : " + error));
                return;
            }
            resolve(true);
            return;
        });
    });
};
Cache.findById = function(index, domain, id, callback, fail) {
    var search = {
        index: index,
        type: domain,
        id: id
    };
    var promise = Cache.getInstance().get(search);
    if (callback) {
        return promise.then(function(result) {
            var objReturn = {};
            try {
                objReturn = miscellaneous.formatResponseCacheOne(result);
                callback.call(this, objReturn);
            }
            catch (e) {
                console.error(e);
                fail.call(this, e);
            }

        }, function(err) {
            if (err.status === 404) {
                callback.call(this, {
                    val: function() {
                        return null;
                    },
                    first:function(){
                        return null;
                    },
                    size: function() {
                        return 0;
                    }
                });
            }
            else {
                fail.call(this, err);
            }
        });
    }
    else {
        return new Promise(function(resolve,reject){
            promise.then(function(result) {
                var objReturn = {};
                try {
                    objReturn = miscellaneous.formatResponseCacheOne(result);
                    resolve(objReturn);
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
    
            }, function(err) {
                if (err.status === 404) {
                    resolve({
                        val: function() {
                            return null;
                        },
                        first:function(){
                            return null;
                        },
                        size: function() {
                            return 0;
                        }
                    });
                }
                else {
                    reject(err);
                }
            });
        });
    }
};
Cache.count = function(index, domain, criterias, callback, fail) {
    var search = {
        index: index,
        type: domain
    };
    if (!util.isNullOrUndefined(criterias)) {
        var sort = criterias.sort;
        var query = {
            "bool": {
                "must": []
            }

        };
        delete criterias.maxResults;
        delete criterias.offset;
        delete criterias.sort;
        var builder = new ElasticsearchBuilder();
        if(_.keys(criterias).length > 0){
            search.body = builder.queryString(criterias).sort(sort).body;
        }
    }

    if (callback) {
        return Cache.getInstance().count(search, function(error, response, status) {
            if (error) {
                fail.call(this, error);
            }
            return callback.call(this, undefined, response.count);
        },function(error){
            fail.call(this,error);
        });
    }
    else {
        return Cache.getInstance().count(search);
    }
};
Cache.query = function(index, domain, criterias, callback, fail) {
    var search = {
        index: index,
        type: domain
    };
    var builder = new ElasticsearchBuilder();
    if (!util.isNullOrUndefined(criterias)) {
        var query = {
            "bool": {
                "must": []
            }

        };
        var offset = null;
        var size = null;
        var sort = criterias.sort;
        var range = criterias.range;
        if (criterias.offset) {
            offset = Number(criterias.offset);
        }
        if (criterias.maxResults) {
            size = Number(criterias.maxResults);
        }
        delete criterias.maxResults;
        delete criterias.offset;
        delete criterias.sort;
        delete criterias.range;
        if(_.keys(criterias).length > 0){
            search.body = builder.queryString(criterias).limit(offset,size).sort(sort).range(range).body;
        }
    }

    var promise = Cache.getInstance().search(search);
    if (callback) {
        return promise.then(function(result) {
            var objReturn = {};
            try {
                Cache.count(index, domain, criterias, function(error, resp) {
                    objReturn = miscellaneous.formatResponseCacheList(result,resp);
                    callback.call(this, objReturn);
                }, function(error) {
                    fail.call(this, error);
                });
            }
            catch (e) {
                fail.call(this, e);
            }
        }, function(err) {
            if (err.status === 404) {
                callback.call(this, {
                    val: function() {
                        return null;
                    },
                    first:function(){
                        return null;
                    },
                    size: function() {
                        return 0;
                    }
                });
            }
            else {
                fail.call(this, err);
            }
        });
    }
    else {
        return new Promise(function(resolve,reject){
            promise.then(function(result) {
                var objReturn = {};
                try {
                    Cache.count(index, domain, criterias, function(error, resp) {
                        objReturn = miscellaneous.formatResponseCacheList(result,resp);
                        resolve(objReturn);
                    }, function(error) {
                       reject(error);
                    });
                }
                catch (e) {
                    reject(e);
                }    
            });
        });
        
    }
};

module.exports = Cache;