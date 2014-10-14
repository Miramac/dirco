/*jshint node: true*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    regenerator: {
        options: {
            includeRuntime: true
        },
        dist: {
            files: {
                'es5/<%= pkg.name %>.js': 'lib/<%= pkg.name %>.js'
            }
        }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false
        },
        src: ['test/*.mocha.js']
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          node: true,
          console: true,
          module: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'mochaTest']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-regenerator');

  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('default', ['jshint', 'regenerator', 'mochaTest']);

};
