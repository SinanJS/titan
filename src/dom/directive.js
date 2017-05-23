/**
 * Created by zpc on 2017/5/19.
 */
define([
    "../core",
    "./velement"
], function (Ti, VElement) {
    var drtUtils = {
        _data: {},
        _scope:{},
        prefix: "t",
        readData: function (data, path) {
            if (typeof path !== "string") {
                return console.error("props must be string");
            }
            var arr = path.split(".");
            var result;
            if (arr.length > 1) {
                result = data;
                for (var i = 0; i < arr.length; i++) {
                    result = result[arr[i]];
                }
            } else {
                if (/\[\d+\]/.test(path)) {
                    //如果path代表一个数组
                    var index = parseInt(path.match(/\d+/)[0]);
                    var name = path.match(/\w+/)[0].toString();
                    result = data[name][index];
                } else {
                    result = data[path];
                }
            }
            return result;
        },
        directives: {
            text: function (children, prop) {
                var text = drtUtils.readData(drtUtils._data,prop);
                var vEl = new VElement("#text", [], {}, text);
                return [vEl];
            },
            for:function (children,prop) {
                var _arr_prop = prop.split('in');
                var itemName = Ti.trim(_arr_prop[0]);
                var scopeName = Ti.trim(_arr_prop[1]);

                return children;
            }
        },
        hocks: {},
        extend: function () {

        }

    };
    return drtUtils;
});