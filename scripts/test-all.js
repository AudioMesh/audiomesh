const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

console.log('Running tests for all workspaces...');
console.log(
  'Arguments to forward to Jest:',
  args.length > 0 ? args.join(' ') : 'none',
);

const workspaces = [
  { name: 'audiomesh-web', type: 'jest' },
  { name: 'audiomesh-server', type: 'cargo' },
  { name: 'audiomesh-desktop', type: 'jest' },
  { name: 'audiomesh-mobile', type: 'jest' },
];

const failures = [];

for (const ws of workspaces) {
  console.log(`\n======================================================`);
  console.log(`Running tests for workspace: ${ws.name}`);
  console.log(`======================================================`);

  let result;
  if (ws.type === 'jest') {
    result = spawnSync('yarn', ['workspace', ws.name, 'test', ...args], {
      stdio: 'inherit',
      shell: true,
    });
  } else if (ws.type === 'cargo') {
    result = spawnSync('yarn', ['workspace', ws.name, 'test'], {
      stdio: 'inherit',
      shell: true,
    });
  }

  if (result && result.status !== 0) {
    failures.push(ws.name);
  }
}

console.log(`\n======================================================`);
if (failures.length > 0) {
  console.error(`Test run completed with failures in: ${failures.join(', ')}`);
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
  process.exit(0);
}
