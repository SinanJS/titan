/**
 * Created by Administrator on 2017/6/21.
 */
define([], function () {
    var i8n = {
        "zh_cn": [
            ['刚刚', '%s秒钟前'],
            ['1分钟前', '%s分钟前'],
            ['1小时前', '%s小时前'],
            ['昨天', '%s天前'],
            ['1周前', '%s周前'],
            ['1个月前', '%s个月前'],
            ['1年前', '%s年前'],
            "yyyy年MM月dd日 hh:mm:ss",
        ],
        "en": [
            ['just now', '%s seconds ago'],
            ['1 minute ago', '%s minutes ago'],
            ['1 hour ago', '%s hours ago'],
            ['yesterday', '%s days ago'],
            ['1 week ago', '%s weeks ago'],
            ['1 month ago', '%s months ago'],
            ['1 year ago', '%s years ago'],
            "MM-dd-yyyy hh:mm:ss",
        ]
    };

    function selectLanguage(lanCode) {
        return i8n[lanCode.toLowerCase()];
    }

    return selectLanguage;
});