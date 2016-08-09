var _ = require("lodash");
var Builder = function() {
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
    this.between = function(v, k) {
        var retorno = [];
        _.each(v, function(value, i) {
            var from = (value.from ? value.from : "*");
            var to = (value.to ? value.to : "*");
            retorno.push(i + ": [" + from + " TO " + to + "]");
        });
        return "(" + retorno.join(" AND ") + ")";
    };
    this.in = function(v,k){
        var listaIn = _.map(v,function(value,i){
            return "(" + i + ":\"" + value.join("\" OR \"") + "\")";
        });
        return "(" + listaIn.join(" AND ") + ")";
    };
    this.buildString = function(v, k) {
        var value = v;
        if (v instanceof Array) {
            value = "\"" + value.join("\" OR \"") + "\"";
        }
        if (value.toString().indexOf("*") == -1) {
            return "(" + k + ":\"" + value + "\")";
        }
        else {
            return "(" + k + ":" + value + ")";
        }
    };
};
module.exports = function() {
    var self = this;
    self.body = {
        query: {}
    };


    self.match = function(v, value) {
        self.body.query.match[v] = value;
        return self;
    };
    self.filter = function(v, value) {
        return self;
    };
    self.queryString = function(fields) {
        self.body.query = {
            "query_string": {
                "allow_leading_wildcard": true,
                "query": (new Builder()).build(fields)
            }
        };
        console.log(self.body.query.query_string.query);
        return self;
    };
    self.limit = function(offset, maxResults) {
        if (offset && !isNaN(offset)) {
            self.body.from = Number(offset);
        }
        if (maxResults && !isNaN(maxResults)) {
            self.body.size = Number(maxResults);
        }
        return self;
    };
    self.sort = function(sort) {
        if (sort) {
            self.body.sort = sort;
        }
        return self;
    };
    self.range = function(range) {
        if (range) {
            var body = self.body || {
                query: {}
            };
            if (!body.query.bool) {
                body.query = {
                    bool: {
                        must: []
                    }
                };
            }
            else {
                if (!body.query.bool.must) {
                    body.query.bool.must = [];
                }
            }
            if (self.body.query.query_string) {
                body.query.bool.must.push(self.body.query.query_string);
            }
            self.body.query.bool.must.range = range;
        }
        return self;
    };
    return self;
};