var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var di = require("../api/_di");

describe("Direct Injection (DI)", function() {
    describe("test to $inject", function() {
        it("Exception",function(){
            expect(di.$inject.bind(this,null,null)).to.throw(Error);    
        });
        it("type not defined",function(){
            expect(di.$inject.bind(this,"test.js",null)).to.throw(Error);    
        });
        it("service",function(){
            assert(di.$inject("testService.js","../test/"));
        });
        it("controller",function(){
            assert(di.$inject("testController.js","../test/"));
        });
        it("not found dependecy",function(){
            expect(di.$inject.bind(this,"helloService.js","../test/")).to.throw(Error);
        });
    });
});
