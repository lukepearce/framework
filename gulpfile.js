
//      ┏━━━━━━━━┓
//      ┃  T  E  ┃
//      ┃  N  4 ━┛
//      ┗━━━━━┛

var PRODUCTION_MODE = false; // Production mode minifies output files and optimises images

var FILE_HEADER = '/*\n┏━━━━━━━━┓\n┃  T  E  ┃\n┃  N  4 ━┛\n┗━━━━━┛\nLast updated on ' + ( new Date() ).toString() + '\n*/\n';

var PATH_TEMPLATES = './craft/templates/**/*.twig'; // Used for template watch task and ftp upload

var FTP_CONFIG = {
	host: '',
	user: '',
	pass: '',
	remotePath: '/public_html/assets'
};

function SRC( path ){
	return './raw' + ( path || '' );
}

function DEST( path ){
	return './public_html/assets' + ( path || '' );
}

var gulp = require( 'gulp' );

// To install new package: 'npm install --save-dev [package name e.g. gulp-concat]'
var gulpif = require( 'gulp-if' );
var livereload = require( 'gulp-livereload' );
var header = require( 'gulp-header' );
var sass = require( 'gulp-sass' );
var autoprefix = require( 'gulp-autoprefixer' );
var minifycss = require( 'gulp-minify-css' );
var csslint = require( 'gulp-csslint' );
var imagemin = require( 'gulp-imagemin' );
var svgmin = require( 'gulp-svgmin' );
var jshint = require( 'gulp-jshint' );
var gconcat = require( 'gulp-concat' );
var uglify = require( 'gulp-uglify' );
var ftp = require( 'gulp-ftp' );

gulp.task( 'js-lint', function(){

	gulp.src( SRC( '/js/*.js' ) )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'default' ) );

} );

gulp.task( 'css-lint', ['sass'], function(){

	gulp.src( DEST( '/css/*.css' ) )
		.pipe( csslint( {
			'adjoining-classes': false,
			'unique-headings': false,
			'qualified-headings': false
		} ) )
		.pipe( csslint.reporter() );

} );

gulp.task( 'sass', function(){

	gulp.src( SRC( '/sass/root.scss' ) )
		.pipe( sass( {
			errLogToConsole:true
		} ) )
		.pipe( gconcat( 'main.css' ) )
		.pipe( gulpif( PRODUCTION_MODE, minifycss() ) )
		.pipe( autoprefix( 'last 2 versions', '> 1%', 'Explorer 8' ) )
		.pipe( header( FILE_HEADER ) )
		.pipe( gulp.dest( DEST( '/css' ) ) );

	gulp.src( SRC( '/sass/site/ie8.scss' ) )
		.pipe( sass( {
			errLogToConsole:true
		} ) )
		.pipe( gconcat( 'ie8.css' ) )
		.pipe( gulpif( PRODUCTION_MODE, minifycss() ) )
		.pipe( autoprefix( 'Explorer 8' ) )
		.pipe( header( FILE_HEADER ) )
		.pipe( gulp.dest( DEST( '/css' ) ) );

} );

gulp.task( 'css', ['css-lint'] );

gulp.task( 'js', ['js-lint'], function(){

	gulp.src( SRC( '/js/libs/*.js' ) )
		.pipe( gconcat( 'libs.js' ) )
		.pipe( header( FILE_HEADER ) )
		.pipe( gulp.dest( DEST( '/js' ) ) );

	gulp.src( SRC( '/js/libs-solo/*.js' ) )
		.pipe( gulp.dest( DEST( '/js' ) ) );

	gulp.src( SRC( '/js/*.js' ) )
		.pipe( gulpif( PRODUCTION_MODE, uglify() ) )
		.pipe( gconcat( 'main.js' ) )
		.pipe( header( FILE_HEADER ) )
		.pipe( gulp.dest( DEST( '/js' ) ) );

} );

gulp.task( 'img', function(){

	gulp.src( SRC( '/img/**/*.{jpg,jpeg,png,gif,ico}' ) )
		.pipe( gulpif( PRODUCTION_MODE, imagemin( {
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		} ) ) )
		.pipe( gulp.dest( DEST( '/img' ) ) );

	gulp.src( SRC( '/img/**/*.svg' ) )
		.pipe( gulpif( PRODUCTION_MODE, svgmin() ) )
		.pipe( gulp.dest( DEST( '/img' ) ) );

} );

gulp.task( 'fonts', function(){

	gulp.src( SRC( '/fonts' ) )
		.pipe( gulp.dest( DEST( '/fonts' ) ) );

} );

gulp.task( 'watch', ['full'], function(){

	livereload.listen();

	gulp.watch( SRC( '/sass/**/*.scss' ), ['css'] );

	gulp.watch( SRC( '/js/**/*' ), ['js'] );

	gulp.watch( SRC( '/img/**/*' ), ['img'] );

	gulp.watch( [
		DEST( '/css/**/*' ),
		DEST( '/js/**/*' ),
		DEST( '/img/**/*' ),
		PATH_TEMPLATES
	] )
		.on( 'change', function( file ){
			livereload.changed( file.path );
		} );

} );

gulp.task( 'upload', function(){

	gulp.src( DEST( '/**/*' ) )
		.pipe( ftp( FTP_CONFIG ) );

} );

gulp.task( 'default', ['watch'] ); // Ctrl-C in terminal to exit watch mode
gulp.task( 'full', ['css','js','img','fonts'] );
