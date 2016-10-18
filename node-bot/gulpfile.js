'use strict';

// ////////////////////////////////////////////////
//
// Task runner for Time-o-Tron
//
// ///////////////////////////////////////////////

const gulp  = require('gulp');
const gutil = require('gulp-util');
const exec  = require('child_process').exec;

// ////////////////////////////////////////////////
// Docker Image and Container details
// ///////////////////////////////////////////////

const packageVer  = require('./package.json').version;
const packageName = require('./package.json').name;
//const imageVer    = 'time-o-tron/'+ packageName +':'+ packageVer;
const imageLatest = 'time-o-tron/'+ packageName +':latest';

// ////////////////////////////////////////////////
// Docker Container Tasks
// - dockerize the component
// - launch the container
// - remove the container
// ///////////////////////////////////////////////

gulp.task('dockerize', done => {
  const dockerize = exec('docker build -t '+ imageLatest +' .', {maxBuffer: 1024*500}, err => done(err));
  dockerize.stdout.pipe(process.stdout);
});

// ////////////////////////////////////////////////
// Deployment Tasks
// - deploy docker image using ssh
// ///////////////////////////////////////////////

gulp.task('deploy', ['dockerize'], done => {
  if (!gutil.env.host) {
    done('Missing host argument');
  } else {
    const deploy = exec('docker save '+ imageLatest +' | gzip | ssh '+ gutil.env.host +
        ' \'docker load && cd hackathon && docker run -d -p 80:8080 '+imageLatest+'\'', err => done(err));
    deploy.stdout.pipe(process.stdout);
  }
});

// ////////////////////////////////////////////////
// Default Task - launch component as container
//                together with dependencies
// ///////////////////////////////////////////////

gulp.task('default', ['dockerize', 'integrate'], done => {
  exec('echo `docker run -d '+ imageLatest +'`', (err, stdout) => {
    if (err || stdout.length === 1) {
      gutil.log(gutil.colors.red('launch failed, abort'));
      process.exit();
    }
    gutil.log(gutil.colors.yellow('launched '+ packageName), stdout);
    done(err);
  });
});
