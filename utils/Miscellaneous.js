const moment = require("moment");
const _ = require("lodash");
var miscellaneous = {
    isNullOrEmpty: function(value){
        return (value === null || value === undefined || value === "null" || value === "undefined" || value.toString().trim() === "");
    },
    toMD5 : function(key){
      return require('crypto').createHash("md5").update(key).digest('hex');
    },
    extend : function(subClass,supreClass) {
       for (var i in supreClass) {
          if (supreClass.hasOwnProperty(i)) {
             subClass[i] = supreClass[i];
          }
       }
       return subClass;
    },
    formatError : function(v){
        return {message:v,error:true};
    },
    hasErrors : function(obj){
        return !!(obj.errors && obj.errors.length > 0);
    },
    toTimestamp : function(obj){
        return obj ? new Date(obj).getTime() : 0;
    },
    addDay : function(date, day){
        return date+(day?day:1)*24*60*60*1000;
    },
    formatDate: function(date,format){
        return moment(date).format(format?format:"YYYY/MM/DD");
    },
    formatResponseCacheOne : function(result){
        var data = {
            list: function(Vo) {
                var list = [];
                var response = {};
                if (result.found) {
                    result._source.id = result._id;
                    response[result._id] = result._source;
                    if(Vo){
                        list.push(new Vo(result._source));
                    }else{
                        list.push(result._source);
                    }
                }
                return list;
            },
            size: function() {
                return result.found ? 1 : 0;
            },
            first : function(Vo){
                return _.find(data.list(Vo));
            },
            total: function(){
                return 1;
            }
        };
        return data;
    },
    formatResponseCacheList : function(result,cont){
        var data = {
            list: function(Vo) {
                var response = {};
                _.each(result.hits.hits, function(v) {
                    v._source.id = v._id;
                    response[v._id] = v._source;
                });
                return _.map(response,function(v){
                    if(Vo){
                        return new Vo(v);
                    }else{
                        return v;
                    }
                });
            },
            size: function() {
                return result.hits.hits.length;
            },
            first: function(Vo){
                return _.find(data.list(Vo));
            },
            total: function() {
                return cont;
            }
        };
        return data;
    },
    formatResponseMemDBOne : function(docs){
        var data  = {
            list : function(Vo){
                if(docs){
                    if(Vo){
                        return [new Vo(docs)];
                    }else{
                        return [docs];
                    }
                }else{
                    return [];
                }
            },
            size: function(){
                if(docs){
                    return 1;
                }else{
                    return 0;
                }
            },
            total: function(){
                return data.size();
            },
            first : function(Vo){
                var list =data.list(Vo);
                if(list.length){
                    return list[0];
                }else{
                    return null;
                }
            }
        };
        return data;
    },
    formatResponseMemDBList : function(docs,cont){
        var data  = {
            list : function(Vo){
                var list = [];
                var retorno = {};
                _.each(docs,function(v){
                    retorno[v.id] = v;
                    list.push(v);
                });
                return _.map(list,function(v){
                    if(Vo){
                        return new Vo(v);
                    }else{
                        return v;
                    }
                });
            },
            size: function(){
                if(docs){
                    return docs.length !== undefined ? docs.length : 1;
                }else{
                    return 0;
                }
            },
            total: function(){
                return cont;
            },
            first : function(Vo){
                var list =data.list(Vo);
                if(list.length){
                    return list[0];
                }else{
                    return null;
                }
            }
        };
        return data;
    },
    formatResponseFireBaseOne : function(snapshot){
        var data = {
            list : function(Vo){
                if(snapshot.val()){
                    if(Vo){
                        return [new Vo(snapshot.val())];
                    }else{
                        return [snapshot.val()];
                    }
                }else{
                    return null;
                }
            },
            size: function() {
                return (!!_.find(snapshot.val())) ? 1 : 0;
            },
            total: function(){
                return (!!_.find(snapshot.val())) ? 1 : 0;
            },
            first: function(Vo){
                var list =data.list(Vo);
                if(list.length){
                    return list[0];
                }else{
                    return null;
                }
            }
        };
        return data;
    },
    formatResponseFireBaseList : function(snapshot,cont){
        var data = {
            list : function(Vo){
                return _.map(snapshot.val(),function(v){
                    if(Vo){
                        return new Vo(v);
                    }else{
                        return v;
                    }
                });
            },
            size: function(){
                return snapshot.size();
            },
            total : function() {
                return cont;
            },
            first: function(Vo){
                var list =data.list(Vo);
                if(list.length){
                    return list[0];
                }else{
                    return null;
                }
            }
        };
        return data;
    },
    formatHttpResponse: function(obj,total,maxResults,offset,error,errorMessage){
        if(obj instanceof Array){
            return {
                list : obj,
                total : total,
                maxResults : maxResults || 0,
                offset : offset || 0,
                error:error,
                errorMessage:errorMessage
            };
        }else{
            return obj;
        }
    },
    isNumber : function(value){
        return value && (typeof(value) === "number" || !!value.toString().match(/[0-9]+/));
    }
};
global.Misc = miscellaneous;
module.exports = miscellaneous;