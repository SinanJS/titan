/**
 * Created by zpc on 2017/5/19.
 */
define([
    "../core",
    "./velement"
], function (Ti, VElement) {
    var drtUtils = {
        _data: {},
        prefix: "t",
        readData: function (data, key) {
            if (typeof key !== "string") {
                return console.error("props must be string");
            }
            var arr = key.split(".");
            var result;
            if (arr.length > 1) {
                result = data;
                for(var i =0;i<arr.length;i++){

                    result = result[arr[i]];
                }
            } else {
                if(/\[/.test(key)){
                    //如果key代表一个数组

                }else{
                    result = data[key];
                }
            }
            return result;
        },
        directives: {
            text: function (children, prop) {
                var text = drtUtils.readData(drtUtils._data,prop);
                console.log("12",text);
                var vEl = new VElement("#text", [], {}, text);
                return [vEl];
            }
        },
        hocks: {},
        extend: function () {

        }

    };
    return drtUtils;
});