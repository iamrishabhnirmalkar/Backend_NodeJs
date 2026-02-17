# Docker Test Script for Windows PowerShell
# Tests Docker setup and database connection

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Setup Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/6] Checking Docker daemon..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.yml exists
Write-Host "[2/6] Checking docker-compose.yml..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    Write-Host "✓ docker-compose.yml found" -ForegroundColor Green
} else {
    Write-Host "✗ docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "[3/6] Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    
    # Check if it has Docker-specific settings
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "MYSQL_HOST=mysql" -or $envContent -match "REDIS_HOST=redis") {
        Write-Host "✓ .env appears to be configured for Docker" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: .env may not be configured for Docker (should use 'mysql' and 'redis' as hosts)" -ForegroundColor Yellow
        Write-Host "  Consider copying .env.docker to .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ .env file not found. Creating from .env.docker..." -ForegroundColor Yellow
    if (Test-Path ".env.docker") {
        Copy-Item ".env.docker" ".env"
        Write-Host "✓ Created .env from .env.docker" -ForegroundColor Green
    } else {
        Write-Host "✗ .env.docker not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Build Docker images
Write-Host "[4/6] Building Docker images..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes on first run..." -ForegroundColor Gray
try {
    docker-compose build --no-cache 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker images built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Docker build error: $_" -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "[5/6] Starting Docker containers..." -ForegroundColor Yellow
try {
    docker-compose up -d 2>&1 | Out-Null
    Write-Host "✓ Containers started" -ForegroundColor Green
    
    # Wait for services to be healthy
    Write-Host "  Waiting for services to be ready (30 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
} catch {
    Write-Host "✗ Failed to start containers: $_" -ForegroundColor Red
    exit 1
}

# Check container status
Write-Host "[6/6] Checking container status..." -ForegroundColor Yellow
$containers = docker-compose ps --format json | ConvertFrom-Json
$allHealthy = $true

foreach ($container in $containers) {
    $name = $container.Name
    $status = $container.State
    $health = $container.Health
    
    if ($status -eq "running") {
        if ($health -eq "healthy" -or $health -eq "") {
            Write-Host "✓ $name is running" -ForegroundColor Green
        } else {
            Write-Host "⚠ $name is running but not healthy yet (status: $health)" -ForegroundColor Yellow
            $allHealthy = $false
        }
    } else {
        Write-Host "✗ $name is not running (status: $status)" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Database Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test health endpoint
Write-Host "Testing API health endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 10  # Give app time to start

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "✓ API is responding" -ForegroundColor Green
        Write-Host "  Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "  Database: $($healthData.database)" -ForegroundColor Gray
        Write-Host "  Redis: $($healthData.redis)" -ForegroundColor Gray
        
        if ($healthData.database -eq "connected") {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "✓ SUCCESS: Docker setup is working!" -ForegroundColor Green
            Write-Host "✓ Database is connected!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠ Warning: API is running but database connection failed" -ForegroundColor Yellow
            Write-Host "  Check logs: docker-compose logs app" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ API health check failed: $_" -ForegroundColor Red
    Write-Host "  Check logs: docker-compose logs app" -ForegroundColor Yellow
    Write-Host "  Check status: docker-compose ps" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs: docker-compose logs -f app" -ForegroundColor Gray
Write-Host "  Stop: docker-compose down" -ForegroundColor Gray
Write-Host "  Restart: docker-compose restart app" -ForegroundColor Gray
Write-Host ""
