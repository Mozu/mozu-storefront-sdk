

require('child_process')
  .spawn('./node_modules/.bin/mocha', [], { stdio: 'inherit' })
  .on('close', function() {
    process.exit(0);
  });