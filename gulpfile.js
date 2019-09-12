/* eslint-disable node/no-unpublished-require */
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer'); // для старых браузеров
//const cssnano = require('gulp-cssnano');

const plumber = require('gulp-plumber'); // плагин отслеживания ошибок
const nodemon = require('nodemon');
const concat = require('gulp-concat');
//const uglify = require('gulp-uglifyjs');
/* eslint-disable node/no-unpublished-require */

function css() { //для сжатия и конкатинации скриптов
    return gulp
        .src('./dev/scss/**/*.scss') // принимает
        .pipe(plumber())
        .pipe(sass()) // принимает изменяет и передает
        .pipe(
            autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { /// принимает добавляет префикс  и передает
                cascade: true
            })
        )
        //.pipe(cssnano()) // сокращает
        .pipe(gulp.dest('public/stylesheets')) //записывает в css
}

function serveR() { //функция вызова сервера 
    nodemon({
        script: 'index.js',
        watch: ['app.js', 'models/*', 'models/*/**', 'routes/*', 'routes/*/**', 'gulpfile.js'],
        ext: 'js'
    }).on('restart', () => {
        gulp.src('index.js')

    });

    gulp.watch('dev/scss/**/*.scss', css); // компилируем 

    function scripts() {
        return gulp
            .src([
                'dev/js/webix/data.js', //подключаем файл webix/form.js                
                'dev/js/webix/index.js', //подключаем файл webix/form.js
                'dev/js/webix/wins.js', //подключаем файл webix/form.js
            ])
            .pipe(concat('scripts.js'))
            //.pipe(uglify()) //сжимает скрипты (на данном проекте потребуется изменение структуры /dev/webix/index)
            .pipe(gulp.dest('public/javascripts')); // выгружает сжатые скрипты

    }
    gulp.watch('./dev/js/**/*.js', scripts);
}
module.exports.default = gulp.series(serveR, css); // устанавливаем дуфолтную работу сервера и скриптов