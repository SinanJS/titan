var gulp = require('gulp');
var reqOptimize = require('gulp-requirejs-optimize');   //- requireJs文件合并所需模块，选择该模块的原因为相对于其它模块活跃度较高
var rename = require("gulp-rename");               //- 文件重命名
var Amdclean = require('gulp-amdclean');


gulp.task("build", function () {
    gulp.src("src/Ti.js")
        .pipe(reqOptimize({
            optimize: 'none',
            prefixMode: 'standard'
        }))
        /*.pipe(Amdclean.gulp({
            'prefixMode': 'standard'
        }))*/
        .pipe(rename("ti.js"))
        .pipe(gulp.dest('dist'));                            //- 映射文件输出目录
});
