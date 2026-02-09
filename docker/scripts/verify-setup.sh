#!/bin/bash
# Docker Setup Verification Script

echo "🔍 Verifying Docker setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

echo "✅ docker-compose is available"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.docker..."
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo "✅ Created .env from .env.docker"
    else
        echo "❌ .env.docker not found. Please create .env file."
        exit 1
    fi
fi

echo "✅ .env file exists"

# Check if services are running
if docker-compose ps | grep -q "backend_app"; then
    echo "✅ Services are running"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
else
    echo "ℹ️  Services are not running. Start with: docker-compose up -d"
fi

echo ""
echo "🎉 Docker setup verification complete!"
echo ""
echo "Next steps:"
echo "  1. For Development: cp docker-compose.override.example.yml docker-compose.override.yml"
echo "  2. Start services: docker-compose up -d"
echo "  3. View logs: docker-compose logs -f app"
echo "  4. Test API: curl http://localhost:8000/api/v1/health"
echo ""
echo "📚 For more information, see: docker/README.md"
