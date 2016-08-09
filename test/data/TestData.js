function TestData(){
}
TestData.save = function(obj)  {return obj;};
TestData.delete = function(id,callback,fail){ return true;};
TestData.getTableReference =function(){ return "table";};
TestData.getInstance = function(){
    return {};
};
TestData.getTimestamp = function(){
    return new Date().getTime();
};
TestData.findById = function(ds, domain, id, callback, fail,nocache){
    callback.call(this,{});
};
TestData.find = function(ds, domain, criterias, callback, fail, nocache){
    callback.call(this,[]);
};
TestData.count = function(ds,domain,criteria,callback,fail,nocache){
    callback.call(this,1);
};
module.exports = TestData;