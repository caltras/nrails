var Datastore = require('nedb');
const Constants = require("../utils/Constants");
const _ = require("lodash");
const miscellaneous = require("../utils/Miscellaneous");
/*
limits allowed

https://github.com/louischatriot/nedb
A copy of the whole database is kept in memory. 
This is not much on the expected kind of datasets (20MB for 10,000 2KB documents).
*/
var BuilderCriteria = function() {
    var operators = ["OR", "AND", "NOT", "BETWEEN", "IN"];
    var self = this;
    self.build = function(cr) {
        delete cr.offset;
        delete cr.maxResults;
        delete cr.sort;
        delete cr.range;
        
        var novaCriteria = {};
        _.each(cr, function(v, k) {
            var op = operators.indexOf(k.toUpperCase());
            if (op > -1) {
                self[operators[op].toLowerCase()](v, k, novaCriteria);
            }
            else {
                novaCriteria[k] = self.buildCriteria(v,k);
            }
        });
        return novaCriteria;
    };
    self.or = function(v, k, cr) {
        cr.$or = _.map(self.build(v), function(v, k) {
            var obj = {};
            obj[k] = v;
            return obj;
        });
        return cr;
    };
    self.not = function(v, k, cr) {
        cr.$not = [self.build(v)];
        return cr;
    };
    self.and = function(v, k, cr) {
        cr.$and = _.map(self.build(v), function(v, k) {
            var obj = {};
            obj[k] = v;
            return obj;
        });
        return cr;
    };
    self.in = function(v, k, cr) {
        _.each(v, function(value, i) {
            cr[i] = {
                $in: value
            };
        });
        return cr;
    };
    self.between = function(v, k, cr) {
        _.each(v, function(value, i) {
            var from = value.from;
            var to = value.to;
            if (from) {
                cr[i] = {
                    $gte: from
                };
            }
            if (to) {
                cr[i] = {
                    $lte: to
                };
            }
        });
        return cr;
    };
    self.buildCriteria = function(v, k) {
        var value = v;
        if(typeof(value) === "string" && value.indexOf("*") > -1){
            var expression = new RegExp(value.replace(/\*/g,""),"gi");
            return {$regex: expression };
        }
        return value;
    };
    return self;
};

var Memory = function() {
    var self = this;
    self.defaultDS = "";
    self.db = {};
    self.createRepository = function(name, defaultDs) {
        if (!self.db[name]) {
            self.db[name] = new Datastore();
            if (defaultDs || !self.defaultDS) {
                self.defaultDS = name;
            }
        }
        return self;
    };
    self.insert = function(data, dataSource) {
        var name = self.defaultDS;
        if (dataSource) {
            name = dataSource;
        }
        self.db[name].insert(data, function(err) {
            if (err) {
                console.log(err);
            }
        });
        return true;
    };
    self.update = function(data, dataSource) {
        var name = self.defaultDS;
        if (dataSource) {
            name = dataSource;
        }
        self.db[name].update({id:data.id},data, {}, function(err) {
            if (err) {
                console.log(err);
            }
        });
        return true;
    };
    self.remove = function(data, dataSource) {
        var name = self.defaultDS;
        if (dataSource) {
            name = dataSource;
        }
        self.db[name].remove(data, function(err) {
            if (err) {
                console.log(err);
            }
        });
        return true;
    };
    self.findOne = function(criteria, dataSource) {
        return new Promise(function(resolve, reject) {
            var name = self.defaultDS;
            if (dataSource) {
                name = dataSource;
            }
            var offset = criteria.size || Constants.DEFAULT_OFFSET;
            var maxResults = criteria.maxResults || Constants.DEFAULT_MAX_RESULTS;
            var sort = criteria.sort || {};

            var novaCriteria = new BuilderCriteria().build(criteria);
            self.db[name].findOne(novaCriteria)
                .sort(sort)
                .skip(offset)
                .limit(maxResults)
                .exec(function(err, docs) {
                    if (err) {
                        reject(err);
                    }else {
                        var data = miscellaneous.formatResponseMemDBOne(docs);
                        resolve(data);    
                    }
                });
        });
    };
    self.find = function(criteria, dataSource) {
        return new Promise(function(resolve, reject) {
            var name = self.defaultDS;
            if (dataSource) {
                name = dataSource;
            }
            var offset = criteria.offset;
            if(miscellaneous.isNullOrEmpty(offset)){
                offset = Constants.DEFAULT_OFFSET;
            }
            var maxResults = criteria.maxResults;
            if(miscellaneous.isNullOrEmpty(maxResults)){
                maxResults = Constants.DEFAULT_MAX_RESULTS;
            }
            var sort = criteria.sort || {};
            var range = criteria.range || {};

            var novaCriteria = new BuilderCriteria().build(criteria);
            //console.log(JSON.stringify(novaCriteria));
            self.db[name].find(novaCriteria)
                .sort(sort)
                .skip(offset)
                .limit(maxResults)
                .exec(function(err, docs) {
                    if (err) {
                        reject(err);
                    }else {
                        self.db[name].count(novaCriteria).exec(function(error,value){
                            if(error){
                                reject(error);
                            }else{
                                var data = miscellaneous.formatResponseMemDBList(docs,value);
                                resolve(data);    
                            }
                        });
                        
                    }
                });
        });
    };
    self.count = function(criteria,dataSource){
        return new Promise(function(resolve,reject){
            var name = self.defaultDS;
                if (dataSource) {
                    name = dataSource;
                }
                var offset = criteria.offset;
                if(miscellaneous.isNullOrEmpty(offset)){
                    offset = Constants.DEFAULT_OFFSET;
                }
                var maxResults = criteria.maxResults;
                if(miscellaneous.isNullOrEmpty(maxResults)){
                    maxResults = Constants.DEFAULT_MAX_RESULTS;
                }
                
                var novaCriteria = new BuilderCriteria().build(criteria);
                self.db[name].count(novaCriteria).exec(function(error,value){
                    if(error){
                        reject(error);
                    }else{
                        resolve(value);    
                    }
                });
        });
    };
    self.on = function(event,callback){
        //callback.call(this);
    };
    return self;
};
Memory.getTableReference = function(ds,domain){
    return new Memory().createRepository(domain,ds);
};
module.exports = Memory;