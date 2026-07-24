const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const specs = [
    { CPU: "1", RAM: "1G", SSD: "20G", Name: "1_CPU_1GB" },
    { CPU: "2", RAM: "2G", SSD: "40G", Name: "2_CPU_2GB" },
    { CPU: "4", RAM: "6G", SSD: "120G", Name: "4_CPU_6GB" },
    { CPU: "8", RAM: "12G", SSD: "240G", Name: "8_CPU_12GB" }
];

const reportDir = path.join(__dirname, '..', 'tests', 'reports');
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

console.log("Starting Hardware Benchmarks...");

for (const spec of specs) {
    console.log("=========================================");
    console.log(`Testing Spec: ${spec.Name} (CPU: ${spec.CPU}, RAM: ${spec.RAM})`);
    console.log("=========================================");

    // Set env vars
    const env = { ...process.env, CPU_LIMIT: spec.CPU, RAM_LIMIT: spec.RAM };
    const rootDir = path.join(__dirname, '..');

    try {
        console.log("Starting Docker containers with limits...");
        execSync('docker-compose -f docker-compose.test.yml up -d --build', { env, cwd: rootDir, stdio: 'inherit' });

        console.log("Waiting for services to spin up (10 seconds)...");
        execSync('node -e "setTimeout(()=>{}, 10000)"'); // Wait 10 seconds

        console.log("Running k6 load test...");
        const reportFile = path.join(reportDir, `benchmark_${spec.Name}.md`);
        
        let k6Output = "";
        try {
            // Using a portable k6 docker container
            k6Output = execSync(`docker run --rm -i --network host -e BASE_URL=http://localhost:5000 -v "${path.join(rootDir, 'tests')}:/tests" grafana/k6 run /tests/load.js`, { env, cwd: rootDir }).toString();
        } catch (err) {
            console.log("k6 encountered an error (or thresholds failed). Capturing output anyway...");
            k6Output = err.stdout ? err.stdout.toString() : err.message;
        }

        const mdContent = `# Benchmark Report for ${spec.Name}

**Specs:** 
- CPU: ${spec.CPU}
- RAM: ${spec.RAM}
- SSD: ${spec.SSD} (Simulated)

## k6 Load Test Results
\`\`\`text
${k6Output}
\`\`\`
`;

        fs.writeFileSync(reportFile, mdContent);
        console.log(`Report saved to ${reportFile}`);

    } catch (err) {
        console.error("An error occurred during testing this spec:", err.message);
    } finally {
        console.log("Tearing down containers...");
        try {
            execSync('docker-compose -f docker-compose.test.yml down -v', { env, cwd: rootDir, stdio: 'inherit' });
        } catch(e) {
            console.error("Failed to teardown:", e.message);
        }
    }
}

console.log("All benchmarks completed!");
