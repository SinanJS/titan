/**
 * Created by Administrator on 2017/6/21.
 */
define(["../core", './timeago_i18n'], function (Ti, i18n) {

    var TimeAgo = function (opt) {
        this.language = i18n(opt.i18n ? opt.i18n : "zh_CN");
        if (opt.fmt) {
            this.language[7] = opt.fmt;
        }

        this.maxDay = opt.maxDay * 60 * 60 * 24;
        this.nowTime = new Date().getTime();
        this.SEC_ARR = [1, 60, 60 * 60, 60 * 60 * 24, 60 * 60 * 24 * 7, 60 * 60 * 24 * 30, 60 * 60 * 24 * 365];//秒，分，时，天，周，月，年进率
    };
    TimeAgo.prototype.setTxt = function (start, differ) {
        var SEC_ARR = this.SEC_ARR;
        var desc = "";
        if (differ > this.maxDay) {
            return this.format(start, this.language[7]);
        }
        for (var i = SEC_ARR.length; i >= 0; i--) {
            var n = Math.floor(differ / SEC_ARR[i]);
            if (n > 1) {
                desc = this.language[i][1].replace("%s", n);
                break;
            } else if (n == 1) {
                desc = this.language[i][0];
                break;
            }

        }
        return desc;
    };

    TimeAgo.prototype.diffTime = function (start) {
        this.startTime = new Date(start).getTime();
        var differ = Math.floor((this.nowTime - this.startTime) / 1000);//相差的秒数
        if (differ < 0) {
            return console.warn("不能输入未来时间");
        }
        return this.setTxt(start, differ);

    };

    TimeAgo.prototype.format = function (dateObj, fmt) {
        if (dateObj instanceof Date === false) {
            dateObj = new Date(dateObj);
        }
        var o = {
            "M+": dateObj.getMonth() + 1, //月份
            "d+": dateObj.getDate(), //日
            "h+": dateObj.getHours(), //小时
            "m+": dateObj.getMinutes(), //分
            "s+": dateObj.getSeconds(), //秒
            "q+": Math.floor((dateObj.getMonth() + 3) / 3), //季度
            "S": dateObj.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dateObj.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    Ti.extend({
        timeAgo: function (opt) {
            return new TimeAgo(opt);
        }
    });
    return TimeAgo;
});