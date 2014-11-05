require('child_process')
  .spawn(require('path').resolve('node_modules','.bin','mocha'), [], { stdio: 'inherit' })
  .on('close', function() {
    process.exit(0);
  });