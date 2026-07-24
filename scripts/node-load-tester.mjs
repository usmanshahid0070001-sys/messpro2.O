import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'http://192.168.253.129:5000/';
const CONCURRENCY = 50;
const DURATION_MS = 15000; // Run for 15 seconds

let totalRequests = 0;
let totalLatency = 0;
let errors = 0;
let running = true;

console.log(`Starting Node.js custom load test against ${TARGET_URL}...`);
console.log(`Concurrency: ${CONCURRENCY} virtual users`);
console.log(`Duration: ${DURATION_MS / 1000} seconds`);

const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

async function worker() {
    while (running) {
        const start = Date.now();
        try {
            await new Promise((resolve, reject) => {
                const req = http.get(TARGET_URL, { agent }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => resolve());
                });
                req.on('error', reject);
                req.setTimeout(2000, () => { req.destroy(); reject(new Error('Timeout')); });
            });
            totalRequests++;
            totalLatency += (Date.now() - start);
        } catch (e) {
            errors++;
        }
    }
}

// Start workers
for (let i = 0; i < CONCURRENCY; i++) {
    worker();
}

// Stop after duration
setTimeout(() => {
    running = false;
    
    const rps = (totalRequests / (DURATION_MS / 1000)).toFixed(2);
    const avgLatency = totalRequests > 0 ? (totalLatency / totalRequests).toFixed(2) : 0;
    
    const report = `# Custom Node.js Load Benchmark
    
**Target:** ${TARGET_URL}
**Concurrency:** ${CONCURRENCY} users
**Duration:** ${DURATION_MS / 1000}s

## Results
- **Total Requests Completed:** ${totalRequests}
- **Requests Per Second (RPS):** ${rps} req/s
- **Average Latency:** ${avgLatency} ms
- **Errors/Timeouts:** ${errors}
`;

    console.log("\n--- BENCHMARK FINISHED ---");
    console.log(report);
    
    const reportFile = path.join(__dirname, '..', 'tests', 'reports', 'benchmark_ubuntu.md');
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, report);
    
    console.log(`Report saved to tests/reports/benchmark_ubuntu.md`);
    process.exit(0);
}, DURATION_MS);
