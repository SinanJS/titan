/**
 * Created by zpc on 2017/5/19.
 */
define([
    "../core",
    "./velement"
], function (Ti,VElement) {
    var drtUtils = {
        _data:{},
        prefix: "t",
        directives: {
            text: function (children,prop) {
                var text = drtUtils._data[prop].toString();
                console.log(text)
                var vEl = new VElement("#text",[],{},text);
                return [vEl];
            }
        },
        hocks: {},
        extend: function () {

        }

    };
    return drtUtils;
});