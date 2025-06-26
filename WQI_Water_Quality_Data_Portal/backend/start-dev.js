const { spawn } = require('child_process');

console.log('🚀 Starting Water Quality Development Servers...\n');

// Start backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Start frontend (assumes React app is in parent directory)
const frontend = spawn('npm', ['start'], {
  cwd: '../',
  stdio: 'inherit',
  shell: true,
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});
