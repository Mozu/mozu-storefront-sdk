// SDK Gruntfile
'use strict';

var allScripts = ['lib/when/when.js', 'lib/uritemplate/bin/uritemplate.js', 'lib/microevent/microevent.js', 'src/constants/default.js', 'src/utils.js', 'src/errors.js', 'src/iframexhr.js', 'src/reference.js', 'src/object.js', 'src/collection.js', 'src/types/*.js', 'src/interface.js', 'src/context.js', 'src/init.js'];

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        toExport: 'Mozu',
        exportAs: 'Mozu',

        releasetemp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read("src/banner.tpl"),
        
        bower: {
            install: {
                cleanup: true
            }
        },
        clean: {
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['<%= releasetemp %>']
            },
            test: {
                src: ['<%= concat.test.dest %>']
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>' + grunt.file.read('src/wrap_header.tpl'),
                footer: grunt.file.read('src/wrap_footer.tpl')
            },
            dist: {
                src: allScripts,
                dest: '<%= releasetemp %>'
            },
            test: {
                src: allScripts.concat('src/init_debug.js'),
                dest: './tests/sdk.js'
            },
            debug: {
                src: allScripts.concat('src/init_debug.js'),
                dest: './dist/<%= pkg.name %>.debug.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= concat.dist.dest %>',
                dest: '<%= pkg.main %>.js'
            }
        },
        connect: {
            server: {
                options: {
                    port: port,
                    base: '.'
                }
            },
            browser: {
                options: {
                    port: port,
                    base: '.',
                    keepalive: true,
                    open: testurl
                }
            }
        },
        mocha: {
            test: {
                options: {
                    reporter: 'Dot',
                    urls: [testurl],
                    run: true
                }
            }
        },
        jsdoc: {
            src: ['src/context.js', 'readme.md'],
            options: {
                destination: 'docs',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-jsdoc');


    grunt.registerTask('test', ['concat:test', 'connect:server', 'mocha', 'clean:test']);
    grunt.registerTask('dist', ['clean:dist', 'concat:dist', 'concat:debug', 'uglify', 'clean:tmp']);
    grunt.registerTask('testbrowser', ['concat:test', 'connect:browser']);
    grunt.registerTask('default', ['bower', 'test', 'dist']);

};
