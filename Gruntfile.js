module.exports = function(grunt) {

grunt.initConfig({
	pkg : grunt.file.readJSON('package.json'),
	uglify : {
		options : {
			banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		},

		my_target : {
			files : {
			
				'build/<%= pkg.name %>.min.js' : [  'src/raphael-patheditor.js'  ]
			
//			,	'src/org/sgx/raphael4gwt/public/raphael4gwt-all-min.js' : [ 
//			 	,	'src/org/sgx/raphael4gwt/public/raphael4gwt-min.js'
//	            ]
			}
		}
	}
});


grunt.loadNpmTasks('grunt-contrib-uglify');

grunt.registerTask('default', [ 'uglify' ]);

};