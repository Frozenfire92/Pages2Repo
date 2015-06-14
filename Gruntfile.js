module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            my_target: {
                files: [{
                  expand: true,
                  cwd: 'app/scripts',
                  src: '*.js',
                  dest: 'dist/scripts'
                }]
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'app/styles',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/styles',
                    ext: '.min.css'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/popup.html': 'app/popup.html',
                    'dist/token.html': 'app/token.html'
                }
            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'app/',
                        src: ['images/*'],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'app/',
                        src: ['lib/**'],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'app/',
                        src: ['manifest.json'],
                        dest: 'dist/'
                    }
                ],
            },
        },

        zip: {
            main: {
                cwd: 'dist/',
                src: ['dist/**'],
                dest: 'pages2repo.zip'
              }
        },

        bump: {
            options: {
                files: ['package.json', 'app/manifest.json'],
                updateConfigs: [],
                commit: false,
                createTag: false,
                push: false,
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },

        clean: ["pages2repo.zip", "dist/**"]
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('default', function(){
        grunt.task.run('clean');
        grunt.task.run('bump');
        grunt.task.run(['uglify', 'cssmin', 'htmlmin']);
        grunt.task.run('copy');
        grunt.task.run('zip');
    });
};
