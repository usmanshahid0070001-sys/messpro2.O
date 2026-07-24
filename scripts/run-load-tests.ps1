$ErrorActionPreference = "Stop"

$Specs = @(
    @{ CPU="1"; RAM="1G"; SSD="20G"; Name="1_CPU_1GB" },
    @{ CPU="2"; RAM="2G"; SSD="40G"; Name="2_CPU_2GB" },
    @{ CPU="4"; RAM="6G"; SSD="120G"; Name="4_CPU_6GB" },
    @{ CPU="8"; RAM="12G"; SSD="240G"; Name="8_CPU_12GB" }
)

Write-Host "Starting Hardware Benchmarks..."
$ReportDir = "$PSScriptRoot\..\tests\reports"
if (-Not (Test-Path -Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir | Out-Null
}

foreach ($spec in $Specs) {
    Write-Host "========================================="
    Write-Host "Testing Spec: $($spec.Name) (CPU: $($spec.CPU), RAM: $($spec.RAM))"
    Write-Host "========================================="

    $env:CPU_LIMIT = $spec.CPU
    $env:RAM_LIMIT = $spec.RAM

    Write-Host "Starting Docker containers with limits..."
    cd "$PSScriptRoot\.."
    docker-compose -f docker-compose.test.yml up -d --build

    Write-Host "Waiting for services to spin up..."
    Start-Sleep -Seconds 10

    Write-Host "Running k6 load test..."
    $ReportFile = "$ReportDir\benchmark_$($spec.Name).md"
    $k6Output = "k6_output.txt"
    
    docker run --rm -i --network host -e BASE_URL=http://localhost:5000 -v "${PWD}/tests:/tests" grafana/k6 run /tests/load.js > $k6Output

    # Generate Markdown without here-strings to avoid parsing errors
    $lines = @()
    $lines += "# Benchmark Report for $($spec.Name)"
    $lines += ""
    $lines += "**Specs:**"
    $lines += "- CPU: $($spec.CPU)"
    $lines += "- RAM: $($spec.RAM)"
    $lines += "- SSD: $($spec.SSD) (Simulated)"
    $lines += ""
    $lines += "## k6 Load Test Results"
    $lines += "```text"
    
    # Read the output and append it
    $k6Lines = Get-Content $k6Output
    foreach ($line in $k6Lines) {
        $lines += $line
    }
    
    $lines += "```"
    $lines += ""

    Set-Content -Path $ReportFile -Value $lines
    Write-Host "Report saved to $ReportFile"

    Write-Host "Tearing down containers..."
    docker-compose -f docker-compose.test.yml down -v
}

Write-Host "All benchmarks completed!"
