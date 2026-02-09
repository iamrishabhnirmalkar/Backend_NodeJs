# Docker Setup Verification Script (PowerShell for Windows)

Write-Host "🔍 Verifying Docker setup..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ docker-compose is available" -ForegroundColor Green
} catch {
    try {
        docker compose version | Out-Null
        Write-Host "✅ docker compose is available" -ForegroundColor Green
    } catch {
        Write-Host "❌ docker-compose is not installed" -ForegroundColor Red
        exit 1
    }
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Copying from .env.docker..." -ForegroundColor Yellow
    if (Test-Path .env.docker) {
        Copy-Item .env.docker .env
        Write-Host "✅ Created .env from .env.docker" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.docker not found. Please create .env file." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Check if services are running
$services = docker-compose ps 2>$null
if ($services -match "backend_app") {
    Write-Host "✅ Services are running" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    docker-compose ps
} else {
    Write-Host "ℹ️  Services are not running. Start with: docker-compose up -d" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Docker setup verification complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. For Development: Copy docker-compose.override.example.yml to docker-compose.override.yml"
Write-Host "  2. Start services: docker-compose up -d"
Write-Host "  3. View logs: docker-compose logs -f app"
Write-Host "  4. Test API: curl http://localhost:8000/api/v1/health"
