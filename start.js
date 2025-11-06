const { spawn } = require('child_process');

// Start Next.js server
const nextServer = spawn('npm', ['run', 'start:next'], {
  stdio: 'inherit',
  shell: true
});

// Start Socket.IO server
const socketServer = spawn('npm', ['run', 'start:chat'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGTERM', () => {
  nextServer.kill();
  socketServer.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  nextServer.kill();
  socketServer.kill();
  process.exit(0);
});

nextServer.on('exit', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  socketServer.kill();
  process.exit(code);
});

socketServer.on('exit', (code) => {
  console.log(`Socket server exited with code ${code}`);
  nextServer.kill();
  process.exit(code);
});