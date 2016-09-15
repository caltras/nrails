var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var miscellaneous = require("../utils/Miscellaneous");
var vo = function(obj){ return obj; };
var mockData = {
    _id: "123456",
    found: true,
    _source: {
        name: "ABC"
    }
};
var mockDataList = {
    hits: {
        hits: [mockData]
    }
};
var mockDataDB = {
    id: "123456",
    name: "ABC"
};
var mockDataDBList = [mockDataDB];
var mockDataFirebase = {
    val : function(){
        return mockDataDB;
    },
    size : function(){
        return 1;
    }
};
var mockDataFirebaseList = {
    val : function(){
        return [mockDataDB];
    },
    size : function(){
        return 1;
    }
};

describe("Test Miscellaneous", function() {
    describe("isNullOrEmpty method", function() {
        it("when null", function() {
            assert(miscellaneous.isNullOrEmpty(null));
        });
        it("when empry", function() {
            assert(miscellaneous.isNullOrEmpty(""));
        });
        it("when undefined", function() {
            assert(miscellaneous.isNullOrEmpty(undefined));
        });
        it("when string null", function() {
            assert(miscellaneous.isNullOrEmpty("null"));
        });
        it("when string undefined", function() {
            assert(miscellaneous.isNullOrEmpty("null"));
        });
    });
    describe("toMD5 method", function() {
        it("12345", function() {
            expect(miscellaneous.toMD5("12345")).to.equals("827ccb0eea8a706c4c34a16891f84e7b");
        });
    });
    describe("extend method", function() {
        it("Object", function() {
            var subClass = {};
            var superClass = {
                name: "ABC"
            };
            subClass = miscellaneous.extend(subClass, superClass);
            expect(subClass.name).to.equals(superClass.name);
        });
    });
    describe("formatError method", function() {
        it("error message", function() {
            expect(miscellaneous.formatError("Message").message).to.equal("Message");
            expect(miscellaneous.formatError("Message").error).to.equal(true);
        });
    });
    describe("isNumber method", function() {
        it("null value", function() {
            assert(!miscellaneous.isNumber(null));
        });
        it("empty value", function() {
            assert(!miscellaneous.isNumber(null));
        });
        it("number value", function() {
            assert(miscellaneous.isNumber(123456));
        });
        it("number string value", function() {
            assert(miscellaneous.isNumber("123456"));
        });
    });
    describe("formatHttpResponse", function() {
        it("Array value", function() {
            var data = {
                size:function(){
                    return 1;
                },
                total: function(){
                    return 1;
                },
                list : function(){
                    return [{id: "123456",name: "ABC"}];
                },
                first: function(){
                    return {id: "123456",name: "ABC"};
                }
            };
            var total = 1;
            assert(miscellaneous.formatHttpResponse(data, total).data);
            //expect(miscellaneous.formatHttpResponse(data, total).data.length).to.equals(1);
        });
    });
    describe("hasErrors method", function() {
        it("error null", function() {
            expect(miscellaneous.hasErrors({})).to.equals(false);
        });
        it("error length ==0", function() {
            expect(miscellaneous.hasErrors({
                errors: []
            })).to.equals(false);
        });
        it("error", function() {
            expect(miscellaneous.hasErrors({
                errors: ["Erro"]
            })).to.equals(true);
        });
    });
    describe("toTimestamp", function() {
        it("obj null", function() {
            expect(miscellaneous.toTimestamp(null)).to.equals(0);
        });
        it("obj not null", function() {
            assert(miscellaneous.toTimestamp("Fri Jul 29 2016 13:48:53"));
        });
    });
    describe("addDay", function() {
        it("add day", function() {
            expect(miscellaneous.addDay(1469810933000, 1)).to.equals(1469897333000);
        });
    });
    describe("formatDate", function() {
        it("format", function() {
            expect(miscellaneous.formatDate(1469810933000, "DD/MM/YYYY")).to.equals("29/07/2016");
        });
    });
    describe("formatResponseCache", function() {
        it("one", function() {
            var format = miscellaneous.formatResponseCacheOne(mockData);
            assert(format.first());
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("one VO", function() {
            var format = miscellaneous.formatResponseCacheOne(mockData);
            assert(format.first(vo));
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("list", function() {
            var format = miscellaneous.formatResponseCacheList(mockDataList, 1);
            assert(format.first());
            assert(format.list());
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("list Vo", function() {
            var format = miscellaneous.formatResponseCacheList(mockDataList, 1);
            assert(format.first(vo));
            assert(format.list(vo));
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
    });
    describe("formatResponseMemDB", function() {
        it("one", function() {
            var format = miscellaneous.formatResponseMemDBOne(mockDataDB);
            assert(format.first());
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("one vo", function() {
            var format = miscellaneous.formatResponseMemDBOne(mockDataDB);
            assert(format.first(vo));
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("list", function() {
            var format = miscellaneous.formatResponseMemDBList(mockDataDBList,1);
            assert(format.first());
            assert(format.list());
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("list vo", function() {
            var format = miscellaneous.formatResponseMemDBList(mockDataDBList,1);
            assert(format.first());
            assert(format.list(vo));
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
    });
    describe("formatResponseFireBase", function() {
        it("one", function() {
            var format = miscellaneous.formatResponseFireBaseOne(mockDataFirebase);
            assert(format.first());
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("one vo", function() {
            var format = miscellaneous.formatResponseFireBaseOne(mockDataFirebase);
            assert(format.first(vo));
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("list", function() {
            var format = miscellaneous.formatResponseFireBaseList(mockDataFirebaseList,1);
            assert(format.first());
            assert(format.list());
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
        it("list vo", function() {
            var format = miscellaneous.formatResponseFireBaseList(mockDataFirebaseList,1);
            assert(format.first(vo));
            assert(format.list(vo));
            expect(format.size()).to.equals(1);
            expect(format.total()).to.equals(1);
        });
    });
});