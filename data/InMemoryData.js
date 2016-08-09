var _ = require("lodash");
var sqlite3 = require('sqlite3').verbose();
var QueryBuilder = function() {
    var operators = ["OR", "AND", "NOT", "BETWEEN","IN"];
    var self = this;
    this.build = function(cr) {
        var query_string = [];
        var cont = 0;
        _.each(cr, function(v, k) {
            var op = operators.indexOf(k.toUpperCase());
            if (op > -1) {
                query_string.push(self[operators[op].toLowerCase()](v, k));
            }else {
                query_string.push(self.buildString(v, k));
            }
            cont++;
        });
        return query_string.join(' AND ').replace(/\s*AND\s*OR\s*/g," OR ");
    };
    this.or = function(v, k) {
        return " OR (" + self.build(v) + ")";
    };
    this.not = function(v, k) {
        return " NOT (" + self.build(v) + ")";
    };
    this.and = function(v, k) {
        return " AND (" + self.build(v) + ")";
    };
    this.in = function(v,k){
        return k + " IN ("+self.build(v)+")";
    };
    this.between = function(v, k) {
        var retorno = [];
        _.each(v, function(value, i) {
            var from = value.from;
            var to = value.to;
            if(from && to){
                retorno.push(i + " BETWEEN " + from + " AND " + to + "");    
            }else{
                if(from && !to){
                    retorno.push(i + " > " + from);
                }else{
                    if(!from && to){
                        retorno.push(i + " < " + to);
                    }
                }
            }
        });
        if(retorno.length){
            return "(" + retorno.join(" AND ") + ")";
        }else{
            return "";
        }
    };
    this.buildString = function(v, k) {
        if(k !=="update"){
            var value = v;
            var isArray = (v instanceof Array);
            if (isArray) {
                value = " IN ('" + value.join("' , '") + "')";
            }
            if (value.toString().indexOf("*") == -1) {
            		if(isArray){
                	return "(" + k + " " + value + ")";
                }else{
                	return "(" + k + "=\"" + value + "\")";
                }
            }
            else {
                return "(" + k + " LIKE '" + value.replace(/\*/g,"%") + "')";
            }
        }else{
            return "";
        }
    };
};
const TYPES = {"timestamp":"NUMERIC","password":"TEXT","number":"NUMERIC","object":"BLOB"};
var Memory = function(){
    var self = this;
    self.db = null;
    self.getInstance = function(){
        if(!self.db || !self.db.open){
            self.db = new sqlite3.Database(':memory:');
        }
        return self.db;
    };
    self.createTable = function(name,schema){
        return new Promise(function(resolve, reject){
            try{
                var db = self.getInstance();
                schema = _.filter(schema,function(v){
                    return v.name !== "update";
                });
                var fields = _.map(schema,function(v,k){ 
                    return v.name/*+" "+(TYPES[v.type] ? TYPES[v.type]:"")*/;
                });
                var sql = "CREATE TABLE "+name+ " ("+fields.join(",")+")";
                console.log(sql);
                db.run(sql,function(data){
                    console.log(data);
                    console.log("Table created "+name);
                    resolve(name);
                });
                //db.close();
            }catch(e){
                console.error(e);    
                reject(e);
            }
        });
    };
    self.insertAll = function(table,list,condition){
        try{
            var db = self.getInstance();
            _.each(list,function(element){
                element = _.omitBy(element,function(e,k){
                    return k ==="update";
                });
                var keys = _.keys(element);
                var values = _.map(element,function(v){
                    if(!!v.toString().match(/(true|false)/)){
                        return v ? 1 : 0;
                    }else{
                        return v && !!v.toString().match(/[a-zA-Z]/g)? "'"+v+"'" : v;
                    }
                });
                var sql = "INSERT INTO "+table+" ("+keys.join(",")+") VALUES ("+values.join(",")+") ";
                if(condition){
                    sql +=" WHERE "+new QueryBuilder().build(condition);
                }
                console.log(sql);
                db.run(sql,function(data){
                    console.log(table);
                    console.log(data);
                });
            });
            //db.close();
        }catch(e){
            console.error(e);    
        }
        return self;
    };
    self.insert = function(table,data,condition){
        try{
            var db = self.getInstance();
            // data = _.filter(data,function(e){
            //     return typeof(e) !== "object";
            // });
            var keys = _.keys(data);
           
            var values = _.map(data,function(v){
                return v && !!v.toString().match(/[a-zA-Z]/g) && !!!v.toString().match(/(true|false)/) ? "'"+v+"'" : v;
            });
            var sql = "INSERT INTO "+table+" ("+keys.join(",")+") VALUES ("+values.join(",")+") ";
            if(condition){
                sql +=" WHERE "+new QueryBuilder().build(condition);
            }
            console.log(sql);
            db.run(sql);
            //db.close();
        }catch(e){
            console.error(e);    
        }
        return self;
    };
    self.update = function(table,data,condition){
        try{
            var db = self.getInstance();
            // data = _.filter(data,function(e){
            //     return typeof(e) !== "object";
            // });
            var values = _.map(data,function(element,k){
                return k+"="+(element && !!element.match(/[a-zA-Z]/g) && !!!element.match(/(true|false)/) ? "'"+element+"'" : element);
            });
            var sql = "UPDATE "+table+" SET "+values.join(",");
            if(condition){
                sql +=" WHERE "+new QueryBuilder().build(condition);
            }
            console.log(sql);
            db.run(sql);
            //db.close();
        }catch(e){
            console.error(e);    
        }
        return self;
    };
    self.delete = function(table,id,condition){
        try{
            var db = self.getInstance();
            var sql = "DELETE "+table+" where id = "+id;
            if(condition){
                sql +=" AND "+new QueryBuilder().build(condition);
            }
            console.log(sql);
            db.run();
            //db.close();
        }catch(e){
            console.error(e);    
        }
        return self;
 
    };
    self.query = function(table,condition){
        var rows = [];
        try{
            var db = self.getInstance();
            var sql = "SELECT * FROM "+table;
            if(condition){
                sql +=" AND "+new QueryBuilder().build(condition);
            }
            console.log(sql);
            db.each(sql, function(err, row) {
                rows.push(row);
            });
        }catch(e){
            console.error(e);
        }
        return rows;
    };
    self.serialize = function(closure){
        var db = self.getInstance();
        db.serialize(closure);
        db.close();
    };
};
module.exports = Memory;