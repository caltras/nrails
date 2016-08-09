var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;

var ElasticsearchBuilder = require("../api/_elastic_query_builder");

describe("Unit test to Builder",function(){
    it("build",function(){
        var builder = new ElasticsearchBuilder();
        var criterias = {
            not : {
                or : {
                    name:"ABC",
                    id: "123456"
                },
            },
            and: {
                name: "BCA"
            },
            between : {from: 5, to :10}
        };
        var sort = {};
        var offset = 0;
        var size = 10;
        var range = {};
        assert(builder.queryString(criterias)
            .limit(offset,size)
                .sort(sort)
                    .range(range).body);
    });
});