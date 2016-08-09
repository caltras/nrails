var DataFactory = function(config,impl){
    var Clazz = require("./"+impl);
    return new Clazz(config);
};
module.exports = DataFactory;