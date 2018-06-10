// Generated on 2017-12-31 using generator-angular-fullstack 4.2.3
'use strict';

import _ from 'lodash';
import del from 'del';
import gulp from 'gulp';
import grunt from 'grunt';
import path from 'path';
import through2 from 'through2';
import gulpLoadPlugins from 'gulp-load-plugins';
import http from 'http';
import open from 'open';
import lazypipe from 'lazypipe';
import nodemon from 'nodemon';
import { Server as KarmaServer } from 'karma';
import runSequence from 'run-sequence';
import { protractor, webdriver_update } from 'gulp-protractor';
import { Instrumenter } from 'isparta';
import webpack from 'webpack-stream';
import makeWebpackConfig from './webpack.make';

var plugins = gulpLoadPlugins();
var config;

const clientPath = 'client';
const serverPath = 'server';
const paths = {
    client: {
        assets: `${clientPath}/assets/**/*`,
        images: `${clientPath}/assets/images/**/*`,
        revManifest: `${clientPath}/assets/rev-manifest.json`,
        scripts: [
            `${clientPath}/**/!(*.spec|*.mock).ts`,
            `!${clientPath}/{typings,test_typings}/**/*`
        ],
        styles: [`${clientPath}/{app,components}/**/*.css`],
        mainStyle: `${clientPath}/app/app.css`,
        views: `${clientPath}/{app,components}/**/*.html`,
        mainView: `${clientPath}/app.html`,
        test: [`${clientPath}/{app,components}/**/*.{spec,mock}.ts`],
        e2e: ['e2e/**/*.spec.js']
    },
    server: {
        scripts: [
            `${serverPath}/**/!(*.spec|*.integration).js`,
            `!${serverPath}/config/local.env.sample.js`
        ],
        json: [`${serverPath}/**/*.json`],
        test: {
            integration: [`${serverPath}/**/*.integration.js`, 'mocha.global.js'],
            unit: [`${serverPath}/**/*.spec.js`, 'mocha.global.js']
        }
    },
    karma: 'karma.conf.js',
    dist: 'dist'
};

const arg = (argList => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);

/********************
 * Helper functions
 ********************/

function onServerLog(log) {
    console.log(plugins.util.colors.white('[') +
        plugins.util.colors.yellow('nodemon') +
        plugins.util.colors.white('] ') +
        log.message);
}

function checkAppReady(cb) {
    var options = {
        host: 'localhost',
        port: config.port
    };
    http
        .get(options, () => cb(true))
        .on('error', () => cb(false));
}

// Call page until first success
function whenServerReady(cb) {
    var serverReady = false;
    var appReadyInterval = setInterval(() =>
        checkAppReady((ready) => {
            if (!ready || serverReady) {
                return;
            }
            clearInterval(appReadyInterval);
            serverReady = true;
            cb();
        }),
        100);
}

/********************
 * Reusable pipelines
 ********************/

let lintClientScripts = lazypipe()
    .pipe(plugins.tslint, require(`./${clientPath}/tslint.json`))
    .pipe(plugins.tslint.report, 'verbose', { emitError: false });

const lintClientTestScripts = lazypipe()
    .pipe(plugins.tslint, require(`./${clientPath}/tslint.json`))
    .pipe(plugins.tslint.report, 'verbose', { emitError: false });

let lintServerScripts = lazypipe()
    .pipe(plugins.eslint, `${serverPath}/.eslintrc`)
    .pipe(plugins.eslint.format);

let lintServerTestScripts = lazypipe()
    .pipe(plugins.eslint, {
        configFile: `${serverPath}/.eslintrc`,
        envs: [
            'node',
            'es6',
            'mocha'
        ]
    })
    .pipe(plugins.eslint.format);

let transpileServer = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.babel, {
        plugins: [
            'transform-class-properties',
            'transform-runtime'
        ]
    })
    .pipe(plugins.sourcemaps.write, '.');

let mocha = lazypipe()
    .pipe(plugins.mocha, {
        reporter: 'spec',
        timeout: 5000,
        require: [
            './mocha.conf'
        ]
    });

let istanbul = lazypipe()
    .pipe(plugins.istanbul.writeReports)
    .pipe(plugins.istanbulEnforcer, {
        thresholds: {
            global: {
                lines: 80,
                statements: 80,
                branches: 80,
                functions: 80
            }
        },
        coverageDirectory: './coverage',
        rootDirectory: ''
    });

/********************
 * Env
 ********************/

gulp.task('env:all', () => {
    let localConfig;
    try {
        localConfig = require(`./${serverPath}/config/local.env`);
    } catch (e) {
        localConfig = {};
    }
    plugins.env({
        vars: localConfig
    });
});

gulp.task('env:test', () => {
    plugins.env({
        vars: { NODE_ENV: 'test' }
    });
});

gulp.task('env:prod', () => {
    plugins.env({
        vars: { NODE_ENV: 'production' }
    });
});

//start add moldovan
gulp.task('env:ci', () => {
    plugins.env({
        vars: { NODE_ENV: 'ci' }
    });
});

gulp.task('env:si', () => {
    plugins.env({
        vars: { NODE_ENV: 'si' }
    });
});

gulp.task('env:prod', () => {
    plugins.env({
        vars: { NODE_ENV: 'prod' }
    });
});
//end add moldovan

/********************
 * Tasks
 ********************/

gulp.task('inject', cb => {
    runSequence(['inject:css'], cb);
});

gulp.task('inject:css', () => {
    return gulp.src(paths.client.mainStyle)
        .pipe(plugins.inject(
            gulp.src(_.union(paths.client.styles, ['!' + paths.client.mainStyle]), { read: false })
                .pipe(plugins.sort()),
            {
                starttag: '/* inject:css */',
                endtag: '/* endinject */',
                transform: (filepath) => {
                    let newPath = filepath
                        .replace(`/${clientPath}/app/`, '')
                        .replace(`/${clientPath}/components/`, '../components/')
                        .replace(/_(.*).css/, (match, p1, offset, string) => p1);
                    return `@import '${newPath}';`;
                }
            }))
        .pipe(gulp.dest(`${clientPath}/app`));
});

gulp.task('webpack:dev', function () {
    const webpackDevConfig = makeWebpackConfig({ DEV: true });
    return gulp.src(webpackDevConfig.entry.app)
        .pipe(plugins.plumber())
        .pipe(webpack(webpackDevConfig))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('webpack:dist', function () {
    const webpackDistConfig = makeWebpackConfig({ BUILD: true });
    return gulp.src(webpackDistConfig.entry.app)
        .pipe(webpack(webpackDistConfig))
        .on('error', (err) => {
            this.emit('end'); // Recover from errors
        })
        .pipe(gulp.dest(`${paths.dist}/client`));
});

gulp.task('webpack:test', function () {
    const webpackTestConfig = makeWebpackConfig({ TEST: true });
    return gulp.src(webpackTestConfig.entry.app)
        .pipe(webpack(webpackTestConfig))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('webpack:e2e', function () {
    const webpackE2eConfig = makeWebpackConfig({ E2E: true });
    return gulp.src(webpackE2eConfig.entry.app)
        .pipe(webpack(webpackE2eConfig))
        .pipe(gulp.dest('.tmp'));
});

// Install DefinitelyTyped TypeScript definition files
gulp.task('typings', () => {
    return gulp.src("./typings.json")
        .pipe(plugins.typings());
});

gulp.task('styles', () => {
    return gulp.src(paths.client.styles)
        .pipe(styles())
        .pipe(gulp.dest('.tmp/app'));
});

gulp.task('transpile:server', () => {
    return gulp.src(_.union(paths.server.scripts, paths.server.json))
        .pipe(transpileServer())
        .pipe(gulp.dest(`${paths.dist}/${serverPath}`));
});

gulp.task('lint:scripts', cb => runSequence(['lint:scripts:client', 'lint:scripts:server'], cb));

gulp.task('lint:scripts:client', () => {
    return gulp.src(_.union(
        paths.client.scripts,
        _.map(paths.client.test, blob => '!' + blob)
    ))
        .pipe(lintClientScripts());
});

gulp.task('lint:scripts:server', () => {
    return gulp.src(_.union(paths.server.scripts, _.map(paths.server.test, blob => '!' + blob)))
        .pipe(lintServerScripts());
});

gulp.task('lint:scripts:clientTest', () => {
    return gulp.src(paths.client.test)
        .pipe(lintClientScripts());
});

gulp.task('lint:scripts:serverTest', () => {
    return gulp.src(paths.server.test)
        .pipe(lintServerTestScripts());
});

gulp.task('jscs', () => {
    return gulp.src(_.union(paths.client.scripts, paths.server.scripts))
        .pipe(plugins.jscs())
        .pipe(plugins.jscs.reporter());
});

gulp.task('clean:tmp', () => del(['.tmp/**/*'], { dot: true }));

gulp.task('start:client', cb => {
    whenServerReady(() => {
        open('http://localhost:' + config.browserSyncPort);
        cb();
    });
});

gulp.task('start:server', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config = require(`./${serverPath}/config/environment`);
    nodemon(`-w ${serverPath} ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:server:prod', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    config = require(`./${paths.dist}/${serverPath}/config/environment`);
    nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:server:debug', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config = require(`./${serverPath}/config/environment`);
    // nodemon(`-w ${serverPath} --debug=5858 --debug-brk ${serverPath}`)
    nodemon(`-w ${serverPath} --inspect --debug-brk ${serverPath}`)
        .on('log', onServerLog);
});

//start add moldovan
gulp.task('start:server:ci', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'ci';
    config = require(`./${paths.dist}/${serverPath}/config/environment`);
    nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:server:si', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'si';
    config = require(`./${paths.dist}/${serverPath}/config/environment`);
    nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:client:ci', cb => {
    whenServerReady(() => {
        console.log('log port: ' +  + config.browserSyncPort);
        open('http://localhost:' + config.browserSyncPort);
        cb();
    });
});

gulp.task('start:client:si', cb => {
    whenServerReady(() => {
        console.log('log port: ' +  + config.browserSyncPort);
        open('http://localhost:' + config.browserSyncPort);
        cb();
    });
});

//end add moldovan

gulp.task('watch', () => {
    var testFiles = _.union(paths.client.test, paths.server.test.unit, paths.server.test.integration);

    plugins.watch(_.union(paths.server.scripts, testFiles))
        .pipe(plugins.plumber())
        .pipe(lintServerScripts());

    plugins.watch(_.union(paths.server.test.unit, paths.server.test.integration))
        .pipe(plugins.plumber())
        .pipe(lintServerTestScripts());
});

gulp.task('serve', cb => {
    runSequence(
        [
            'clean:tmp',
            'lint:scripts',
            'inject',
            'copy:fonts:dev',
            'env:all',
            'typings'
        ],
        // 'webpack:dev',
        ['start:server', 'start:client'],
        'watch',
        cb
    );
});

gulp.task('serve:debug', cb => {
    runSequence(
        [
            'clean:tmp',
            'lint:scripts',
            'inject',
            'copy:fonts:dev',
            'env:all',
            'typings'
        ],
        'webpack:dev',
        ['start:server:debug', 'start:client'],
        'watch',
        cb
    );
});

gulp.task('serve:dist', cb => {
    runSequence(
        'build',
        'env:all',
        'env:prod',
        ['start:server:prod', 'start:client'],
        cb);
});

//start add moldovan
gulp.task('serve:ci', cb => {
    runSequence(
        [
            'clean:tmp',
            'lint:scripts',
            'inject',
            'copy:fonts:dev',
            'env:ci',
            'typings'
        ],
        // 'webpack:dev',
        ['start:server:ci', 'start:client:ci'],
        'watch',
        cb
    );
});

gulp.task('serve:si', cb => {
    runSequence(
        [
            'clean:tmp',
            'lint:scripts',
            'inject',
            'copy:fonts:dev',
            'env:si',
            'typings'
        ],
        // 'webpack:dev',
        ['start:server:si', 'start:client:si'],
        'watch',
        cb
    );
});

//end add moldovan

gulp.task('test', cb => {
    return runSequence('test:server', 'test:client', cb);
});

gulp.task('test:server', cb => {
    runSequence(
        'env:all',
        'env:test',
        'mocha:unit',
        'mocha:integration',
        cb);
});

gulp.task('mocha:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha());
});

gulp.task('mocha:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha());
});

gulp.task('test:server:coverage', cb => {
    runSequence('coverage:pre',
        'env:all',
        'env:test',
        'coverage:unit',
        'coverage:integration',
        cb);
});

gulp.task('coverage:pre', () => {
    return gulp.src(paths.server.scripts)
        // Covering files
        .pipe(plugins.istanbul({
            instrumenter: Instrumenter, // Use the isparta instrumenter (code coverage for ES6)
            includeUntested: true
        }))
        // Force `require` to return covered files
        .pipe(plugins.istanbul.hookRequire());
});

gulp.task('coverage:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha())
        .pipe(istanbul())
    // Creating the reports after tests ran
});

gulp.task('coverage:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha())
        .pipe(istanbul())
    // Creating the reports after tests ran
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

gulp.task('test:e2e', ['webpack:e2e', 'env:all', 'env:test', 'start:server', 'webdriver_update'], cb => {
    gulp.src(paths.client.e2e)
        .pipe(protractor({
            configFile: 'protractor.conf.js',
        }))
        .on('error', e => { throw e })
        .on('end', () => { process.exit() });
});

gulp.task('test:client', done => {
    new KarmaServer({
        configFile: `${__dirname}/${paths.karma}`,
        singleRun: true
    }, err => {
        done(err);
        process.exit(err);
    }).start();
});

//add cmc
gulp.task('build-image---cu-docker', function () {
    console.log('BUILDING IMAGE');

    var shell = require("shelljs");

    if (arg['imageId']) {
        var rc = shell.exec('docker build -t webappno1:' + arg['imageId'] + ' ./dist').code;
        console.log('docker build -t webappno1:' + arg['imageId'] + ' ./dist');
        
        if (rc > 0) {
            console.log('DOCKER FAILURE')
        } else {
            console.log('DOCKER OK');
        }
    } else {
        console.log('must supply an imageId to build');
        console.log('PROCESS STOPPED WITH ERROR ON DOCKER');
    }
});

//add cmc
gulp.task('deploy-image---cu-docker', function () {
    console.log('targetEnv: ' + arg['targetEnv'])
    console.log('imageId: ' + arg['imageId'])

    var ports = {
        prod: '9000',
        ci: '9001',
        si: '9002'
    };
/*
    if (arg['imageId'] && arg['targetEnv']) {
        var shell = require("shelljs");

        console.log('STEP 1 - Removing existing containers');
        shell.exec('docker stop webappno1-' + arg['targetEnv'] + ' && docker rm webappno1-' + arg['targetEnv']);

        if (arg['targetEnv'] === 'ci') {   
            console.log('STEP 2 - Deploying ' + arg['targetEnv'] + ' container');     
            var rc = shell.exec('docker run -t -d --name webappno1-' + arg['targetEnv'] + ' -p ' + ports[arg['targetEnv']] + ':' + ports[arg['targetEnv']] + ' --env NODE_ENV=' + arg['targetEnv'] + ' webappno1:' + arg['imageId']);
            if (rc > 0) {
                console.log("DOCKER FAILURE")
            }
        }
        
        if (arg['targetEnv'] === 'si' || arg['targetEnv'] === 'prod') {
            console.log('STEP 2 - Deploying ' + arg['targetEnv'] + ' container');            
            console.log('STEP 3 - Check if MongoDB container is up and runing'); 
            
            //it's possible to have MONGODB service up and runnings
            var isMongo = shell.exec('docker ps | grep webappno1db').code;
            if (isMongo > 0) {
                console.log('STEP 3.1 - Run MongoDB as a Docker container');
                shell.exec('docker run --name webappno1db -p27017:27017 -d mongo:3.4.2');
            }

            console.log('STEP 4 - Run the comntent as into a docker container');     
            console.log('docker run -t -d --name webappno1-' + arg['targetEnv'] + ' --link webappno1db:mongo.server -p '
            + ports[arg['targetEnv']] + ':' + ports[arg['targetEnv']] 
            + ' --env NODE_ENV=' + arg['targetEnv'] + ' webappno1:' + arg['imageId']);

            var rc = shell.exec('docker run -t -d --name webappno1-' + arg['targetEnv'] + ' --link webappno1db:mongo.server -p '
                + ports[arg['targetEnv']] + ':' + ports[arg['targetEnv']] 
                + ' --env NODE_ENV=' + arg['targetEnv'] + ' webappno1:' + arg['imageId']).code;            
            if (rc > 0) {
                console.log("DOCKER FAILURE");
            }
        }
    } else {
        console.log('Required param not set - use gulp deploy\:\<target\>\:\<tag\>');
        console.log('PROCESS STOPPED WITH ERROR ON DOCKER');
    }
    //*/
});

//add cmc
gulp.task('build-image', function () {
    console.log('BUILDING IMAGE');

    var shell = require("shelljs");

    if (arg['imageId']) {
        var rc = shell.exec('docker build -t webappno1:' + arg['imageId'] + ' .').code;
        console.log('docker build -t webappno1:' + arg['imageId'] + ' .');
        
        if (rc > 0) {
            console.log('DOCKER FAILURE')
        } else {
            console.log('DOCKER OK');
        }
    } else {
        console.log('must supply an imageId to build');
        console.log('PROCESS STOPPED WITH ERROR ON DOCKER');
    }
});

gulp.task('deploy-image', function () {
    // fetch command line arguments
    console.log('imageId: ' + arg['imageId'])

    console.log('START')
    var shell = require("shelljs");
    console.log('BUILDING IMAGE');
    if (!arg['imageId']) {
        console.log('must supply an imageId to build');
    }
    var rc = shell.exec('docker-compose up -d').code;

    console.log('rc:' + rc)

    if (rc > 0) {
        console.log('DOCKER FAILURE')
    }

    console.log('STOP')
});
/********************
 * Build
 ********************/

gulp.task('build', cb => {
    runSequence(
        [
            'clean:dist',
            'clean:tmp'
        ],
        'inject',
        'transpile:server',
        [
            'build:images',
            'typings'
        ],
        [
            'copy:docker',
            'copy:extras',
            'copy:assets',
            'copy:fonts:dist',
            'copy:server',
            'webpack:dist'
        ],
        'revReplaceWebpack',
        cb);
});

//add cmc
gulp.task('servex', cb => {
    runSequence(
        [
            'clean:tmp',
            'lint:scripts',
            'inject',
            'copy:fonts:dev',
            'env:all',
            'typings'
        ]
    );
});

gulp.task('clean:dist', () => del([`${paths.dist}/!(.git*|.openshift|Procfile)**`], { dot: true }));

gulp.task('build:images', () => {
    return gulp.src(paths.client.images)
        .pipe(plugins.imagemin([
            plugins.imagemin.optipng({ optimizationLevel: 5 }),
            plugins.imagemin.jpegtran({ progressive: true }),
            plugins.imagemin.gifsicle({ interlaced: true }),
            plugins.imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ]))
        .pipe(plugins.rev())
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/images`))
        .pipe(plugins.rev.manifest(`${paths.dist}/${paths.client.revManifest}`, {
            base: `${paths.dist}/${clientPath}/assets`,
            merge: true
        }))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('revReplaceWebpack', function () {
    return gulp.src('dist/client/app.*.js')
        .pipe(plugins.revReplace({ manifest: gulp.src(`${paths.dist}/${paths.client.revManifest}`) }))
        .pipe(gulp.dest('dist/client'));
});

gulp.task('copy:extras', () => {
    return gulp.src([
        `${clientPath}/favicon.ico`,
        `${clientPath}/robots.txt`,
        `${clientPath}/.htaccess`
    ], { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});

/**
 * turns 'bootstrap/fonts/font.woff' into 'bootstrap/font.woff'
 */
function flatten() {
    return through2.obj(function (file, enc, next) {
        if (!file.isDirectory()) {
            try {
                let dir = path.dirname(file.relative).split(path.sep)[0];
                let fileName = path.normalize(path.basename(file.path));
                file.path = path.join(file.base, path.join(dir, fileName));
                this.push(file);
            } catch (e) {
                this.emit('error', new Error(e));
            }
        }
        next();
    });
}

gulp.task('copy:fonts:dev', () => {
    return gulp.src('node_modules/{bootstrap,font-awesome}/fonts/*')
        .pipe(flatten())
        .pipe(gulp.dest(`${clientPath}/assets/fonts`));
});

gulp.task('copy:fonts:dist', () => {
    return gulp.src('node_modules/{bootstrap,font-awesome}/fonts/*')
        .pipe(flatten())
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/fonts`));
});

gulp.task('copy:assets', () => {
    return gulp.src([paths.client.assets, '!' + paths.client.images])
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('copy:server', () => {
    return gulp.src([
        'package.json'
    ], { cwdbase: true })
        .pipe(gulp.dest(paths.dist));
});

'cmc'
gulp.task('copy:docker', () => {
    return gulp.src([
        'Dockerfile',
        'Dockerfile-ci',
        'docker-compose.yml',
        'docker-compose-ci.yml'
    ], { cwdbase: true })
        .pipe(gulp.dest(paths.dist));
});

/********************
 * Grunt ported tasks
 ********************/

grunt.initConfig({
    buildcontrol: {
        options: {
            dir: paths.dist,
            commit: true,
            push: true,
            connectCommits: false,
            message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
        },
        heroku: {
            options: {
                remote: 'heroku',
                branch: 'master'
            }
        },
        openshift: {
            options: {
                remote: 'openshift',
                branch: 'master'
            }
        }
    }
});

grunt.loadNpmTasks('grunt-build-control');

gulp.task('buildcontrol:heroku', function (done) {
    grunt.tasks(
        ['buildcontrol:heroku'],    //you can add more grunt tasks in this array
        { gruntfile: false }, //don't look for a Gruntfile - there is none. :-)
        function () { done(); }
    );
});

gulp.task('buildcontrol:openshift', function (done) {
    grunt.tasks(
        ['buildcontrol:openshift'],  //you can add more grunt tasks in this array
        { gruntfile: false }, //don't look for a Gruntfile - there is none. :-)
        function () { done(); }
    );
});
