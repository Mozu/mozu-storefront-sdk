var childProcess = require('child_process'),
  mochaExecutablePath = require('path').resolve('node_modules','.bin','mocha'),
  testProcess;
if (/^win/.test(process.platform)) {
  testProcess = childProcess.spawn('cmd', ['/c', mochaExecutablePath], { stdio: 'inherit' });
} else {
  testProcess = childProcess.spawn(mochaExecutablePath, [], { stdio: 'inherit' });
}

testProcess.on('close', function() {
  process.exit(0);
});