// SDK Gruntfile
'use strict';

var allScripts = ['lib/when/when.js', 'lib/uritemplate/bin/uritemplate.js', 'lib/microevent/microevent.js', 'src/constants/default.js', 'src/utils.js', 'src/errors.js', 'src/iframexhr.js', 'src/reference.js', 'src/object.js', 'src/collection.js', 'src/types/*.js', 'src/interface.js', 'src/context.js', 'src/init.js'];

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        releasetemp: '<%= pkg.name %>.tmp',

        banner: grunt.file.read("src/banner.tpl"),

        toExport: "MozuSDK",

        testPlatform: './tests/sdk.js',
       
        clean: {
            dist: {
                src: ['dist']
            },
            tmp: {
                src: ['<%= releasetemp %>']
            },
            test: {
                src: ['<%= testPlatform %>']
            }
        },
        browserify: {
            debug: {
                files: {
                    '<%= testPlatform %>': ['./src/init_debug.js']
                },
                options: {
                    debug: true,
                    standalone: "<%= toExport %>",
                    bare: true,
                    external: ["xmlhttprequest"]
                }
            },
            dist: {
                files: {
                    '<%= releasetemp %>': ['./src/init.js']
                },
                options: {
                    standalone: '<%= toExport %>',
                    bare: true,
                    external: ["xmlhttprequest"]
                }
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>'
            },
            debug: {
                src: '<%= testPlatform %>',
                dest: './dist/<%= pkg.name %>.debug.js'
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: '<%= releasetemp %>',
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-browserify');


    grunt.registerTask('test', ['browserify:debug', 'connect:server', 'mocha']);
    grunt.registerTask('dist', ['clean:dist', 'browserify:dist', 'concat:debug', 'uglify', 'clean:tmp']);
    grunt.registerTask('testbrowser', ['browserify:debug', 'connect:browser']);
    grunt.registerTask('default', ['test', 'dist', 'clean:test']);

};
