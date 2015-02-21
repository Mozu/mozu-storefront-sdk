// SDK Gruntfile
'use strict';

var port = 9001,
    testurl = "http://127.0.0.1:" + port + "/tests/SpecRunner.html";

var through = require('through'),
    path = require('path'),
    crlfRE = /\r\n|\n|\r/g,
    wd = process.cwd(),
    normalizeTo = "\n";

function bNormalizeLineEndingsTransform(file) {
    var data = '';
    return through(write, end);

    function write(buf) { data += buf }
    function end() {
        var tag = "\n\n//# sourceUrl=" + path.relative(wd, file).replace(/\\/g,'/') + "\n\n";
        this.queue(tag + data.replace(crlfRE, normalizeTo));
        this.queue(null);
    }
};

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
                    '<%= testPlatform %>': ['./src/debug.js']
                },
                options: {
                    //debug: true,
                    standalone: "<%= toExport %>",
                    bare: true,
                    external: ["xmlhttprequest"],
                    transform: [bNormalizeLineEndingsTransform]
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
                    reporter: 'Nyan',
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