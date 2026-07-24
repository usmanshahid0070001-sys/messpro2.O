import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                https.get(response.headers.location, (redirectResponse) => {
                    redirectResponse.pipe(file);
                    file.on('finish', () => { file.close(resolve); });
                }).on('error', (err) => { fs.unlink(dest); reject(err); });
            } else {
                response.pipe(file);
                file.on('finish', () => { file.close(resolve); });
            }
        }).on('error', (err) => { fs.unlink(dest); reject(err); });
    });
};

async function start() {
    try {
        console.log("1. Setting up k6 on Windows...");
        const k6Zip = path.join(__dirname, 'k6.zip');
        const k6Dir = path.join(__dirname, 'k6-v0.49.0-windows-amd64');
        const k6Exe = path.join(k6Dir, 'k6.exe');

        if (!fs.existsSync(k6Exe)) {
            console.log("Downloading k6 for Windows (might take a few seconds)...");
            await downloadFile('https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-windows-amd64.zip', k6Zip);
            console.log("Extracting k6...");
            execSync(`powershell Expand-Archive -Path "${k6Zip}" -DestinationPath "${__dirname}" -Force`);
            fs.unlinkSync(k6Zip);
        }

        console.log("2. Running Load Test against Ubuntu VM...");
        const rootDir = path.join(__dirname, '..');
        const loadScript = path.join(rootDir, 'tests', 'load.js');
        const reportDir = path.join(rootDir, 'tests', 'reports');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
        
        const reportFile = path.join(reportDir, 'benchmark_ubuntu.md');

        console.log(`Hammering http://192.168.253.129:5000 with 50 users...`);
        let k6Output = "";
        try {
            k6Output = execSync(`"${k6Exe}" run "${loadScript}"`, { 
                env: { ...process.env, BASE_URL: 'http://192.168.253.129:5000' } 
            }).toString();
        } catch (e) {
            console.log("Load test finished (some thresholds might have failed under load).");
            k6Output = e.stdout ? e.stdout.toString() : e.message;
        }

        const mdContent = `# Remote Ubuntu VM Benchmark Report
        
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

        fs.writeFileSync(reportFile, mdContent);
        console.log(`✅ Benchmark Completed! Report saved to tests/reports/benchmark_ubuntu.md`);

    } catch (err) {
        console.error("Failed to run test:", err);
    }
}

start();
