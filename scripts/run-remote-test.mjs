import { NodeSSH } from 'node-ssh';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ssh = new NodeSSH();

// Remote Server Details (from user)
const REMOTE = {
    host: '192.168.253.129',
    username: 'manan0010',
    password: 'Megabite03261678545'
};

const REMOTE_DIR = '/home/manan0010/messpro_test';

async function runCommand(command, cwd = REMOTE_DIR) {
    console.log(`[Remote] Executing: ${command}`);
    const result = await ssh.execCommand(command, { cwd });
    if (result.stdout) console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);
    if (result.code !== 0) {
        throw new Error(`Command failed with code ${result.code}`);
    }
    return result.stdout;
}

async function start() {
    try {
        console.log(`Connecting to ${REMOTE.host}...`);
        await ssh.connect(REMOTE);
        console.log('Connected successfully!');

        // 1. Setup Directories
        console.log(`Setting up remote directory at ${REMOTE_DIR}...`);
        await runCommand(`mkdir -p ${REMOTE_DIR}`);

        // 2. Transfer Files
        console.log('Transferring Backend Files (This might take a minute)...');
        const localBackendDir = path.join(__dirname, '..', 'backend');
        const localTestsDir = path.join(__dirname, '..', 'tests');

        await ssh.putDirectory(localBackendDir, `${REMOTE_DIR}/backend`, {
            recursive: true,
            concurrency: 10,
            validate: (itemPath) => {
                const baseName = path.basename(itemPath);
                return baseName !== 'node_modules' && baseName !== '.git';
            }
        });

        console.log('Transferring Test Files...');
        await ssh.putDirectory(localTestsDir, `${REMOTE_DIR}/tests`, {
            recursive: true,
            concurrency: 10
        });

        // 3. Setup Node.js and PM2 on Remote (Assuming Ubuntu/Debian)
        console.log('Installing Node.js & NPM on remote (if not installed)...');
        await runCommand(`echo '${REMOTE.password}' | sudo -S bash -c "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"`, '/home/manan0010');
        await runCommand(`echo '${REMOTE.password}' | sudo -S apt-get install -y nodejs`, '/home/manan0010');
        await runCommand(`echo '${REMOTE.password}' | sudo -S npm install -g pm2`, '/home/manan0010');

        // 4. Install backend dependencies
        console.log('Installing backend dependencies remotely...');
        await runCommand('npm install', `${REMOTE_DIR}/backend`);

        // 5. Start Backend Server using PM2
        console.log('Starting Backend Server...');
        // We override MONGO_URI to use the local mongo on the ubuntu server (as requested)
        // PM2 restarts will drop old ones
        await runCommand('pm2 delete all || true', `${REMOTE_DIR}/backend`);
        await runCommand('PORT=5000 MONGO_URI=mongodb://127.0.0.1:27017/messpro_test NODE_ENV=production pm2 start src/server.js --name messpro-backend', `${REMOTE_DIR}/backend`);

        // Wait a few seconds for server to start
        console.log('Waiting for server to initialize...');
        await new Promise(res => setTimeout(res, 5000));

        // 6. Setup k6 on remote
        console.log('Installing k6 on remote...');
        await runCommand(`echo '${REMOTE.password}' | sudo -S apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69`, '/home/manan0010');
        await runCommand(`echo '${REMOTE.password}' | sudo -S bash -c "echo 'deb https://dl.k6.io/deb stable main' | tee /etc/apt/sources.list.d/k6.list"`, '/home/manan0010');
        await runCommand(`echo '${REMOTE.password}' | sudo -S apt-get update`, '/home/manan0010');
        await runCommand(`echo '${REMOTE.password}' | sudo -S apt-get install k6 -y`, '/home/manan0010');

        // 7. Run Load Test
        console.log('Running load test with k6 on 4 Cores, 8GB RAM Ubuntu Server...');
        const k6Output = await runCommand('BASE_URL=http://localhost:5000 k6 run tests/load.js', `${REMOTE_DIR}`);

        // 8. Generate and download report
        const reportContent = `# Remote Ubuntu VM Benchmark Report
        
**Specs:** 
- CPU: 4 Cores
- RAM: 8GB
- SSD: 40GB
- OS: Ubuntu

## k6 Load Test Results
\`\`\`text
${k6Output}
\`\`\`
`;
        console.log('Saving report locally...');
        const fs = await import('fs');
        const reportDir = path.join(__dirname, '..', 'tests', 'reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
        
        fs.writeFileSync(path.join(reportDir, 'remote_benchmark_ubuntu.md'), reportContent);
        
        console.log('✅ Remote Benchmark Completed! Report saved to tests/reports/remote_benchmark_ubuntu.md');

    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        console.log('Cleaning up remote processes...');
        try {
            await runCommand('pm2 delete all', `${REMOTE_DIR}/backend`);
        } catch (e) { /* ignore */ }
        
        ssh.dispose();
    }
}

start();
