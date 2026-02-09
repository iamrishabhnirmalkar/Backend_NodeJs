# Docker File Structure

Complete overview of Docker-related files and their organization.

## 📁 Directory Structure

```
Backend_NodeJs/
│
├── Dockerfile                          # Production multi-stage Dockerfile
├── Dockerfile.dev                      # Development Dockerfile with hot reload
├── docker-compose.yml                  # Main Docker Compose configuration
├── docker-compose.override.example.yml # Development override template
├── .dockerignore                       # Files excluded from Docker build
├── .env.docker                         # Docker environment variables template
│
└── docker/                             # Docker-related files and scripts
    ├── README.md                       # Complete Docker documentation
    ├── STRUCTURE.md                    # This file
    │
    └── scripts/                        # Helper scripts
        ├── wait-for-mysql.sh          # Wait for MySQL to be ready (Linux/macOS)
        ├── verify-setup.sh            # Verify Docker setup (Linux/macOS)
        ├── verify-setup.ps1            # Verify Docker setup (Windows)
        └── test-docker.ps1             # Test Docker setup (Windows)
```

## 📄 File Descriptions

### Root Level Files

#### `Dockerfile`

- **Purpose**: Production multi-stage build
- **Stages**:
  - `base`: Builds application, generates Prisma client, compiles TypeScript
  - `production`: Runtime image with only production dependencies
- **Features**:
  - Optimized image size
  - Non-root user for security
  - Health checks enabled
  - Production dependencies only

#### `Dockerfile.dev`

- **Purpose**: Development build with hot reload support
- **Features**:
  - Includes nodemon and ts-node
  - All dependencies (including dev)
  - Source code mounted as volume
  - Fast rebuild times

#### `docker-compose.yml`

- **Purpose**: Main Docker Compose configuration
- **Services**:
  - `mysql`: MySQL 8.0 database
  - `redis`: Redis cache
  - `app`: Node.js backend application
- **Features**:
  - Works for all environments (dev/test/prod)
  - Health checks for all services
  - Automatic migrations on startup
  - Volume persistence

#### `docker-compose.override.example.yml`

- **Purpose**: Template for development hot reload
- **Usage**: Copy to `docker-compose.override.yml` for development
- **Features**:
  - Hot reload enabled
  - Source code mounted
  - Development command

#### `.dockerignore`

- **Purpose**: Exclude files from Docker build context
- **Excludes**:
  - `node_modules`, `dist`, `generated`
  - `.env` files (except examples)
  - Git files, IDE files, logs
  - Documentation (except README)

#### `.env.docker`

- **Purpose**: Template for Docker environment variables
- **Usage**: Copy to `.env` and customize
- **Contains**: Database, Redis, JWT, and server configuration

### Docker Directory Files

#### `docker/README.md`

- **Purpose**: Complete Docker documentation
- **Contents**:
  - Quick start guide
  - File structure overview
  - Dockerfile explanations
  - Docker Compose configuration
  - Common commands
  - Troubleshooting guide
  - Security best practices

#### `docker/STRUCTURE.md`

- **Purpose**: This file - structure overview

### Scripts Directory

#### `docker/scripts/wait-for-mysql.sh`

- **Purpose**: Wait for MySQL to be ready before starting app
- **Platform**: Linux/macOS
- **Usage**: Used in Docker Compose entrypoint scripts

#### `docker/scripts/verify-setup.sh`

- **Purpose**: Verify Docker setup is correct
- **Platform**: Linux/macOS
- **Checks**:
  - Docker daemon running
  - docker-compose available
  - `.env` file exists
  - Services status

#### `docker/scripts/verify-setup.ps1`

- **Purpose**: Verify Docker setup is correct
- **Platform**: Windows PowerShell
- **Checks**: Same as `verify-setup.sh`

#### `docker/scripts/test-docker.ps1`

- **Purpose**: Comprehensive Docker test script
- **Platform**: Windows PowerShell
- **Features**:
  - Builds Docker images
  - Starts containers
  - Tests database connection
  - Verifies API health endpoint

## 🔄 Workflow

### Development

1. Copy `.env.docker` to `.env`
2. Set `NODE_ENV=development` in `.env`
3. Copy `docker-compose.override.example.yml` to `docker-compose.override.yml`
4. Run `docker-compose up -d`
5. Code changes trigger hot reload automatically

### Production

1. Copy `.env.docker` to `.env`
2. Set `NODE_ENV=production` in `.env`
3. Update passwords and secrets
4. Ensure `docker-compose.override.yml` doesn't exist
5. Run `docker-compose up -d --build`

### Testing

1. Copy `.env.docker` to `.env`
2. Set `NODE_ENV=test` in `.env`
3. Set `MYSQL_DATABASE=backend_nodejs_test`
4. Ensure `docker-compose.override.yml` doesn't exist
5. Run `docker-compose up -d`

## 📝 Best Practices

1. **Never commit `.env` files** - Use `.env.docker` as template
2. **Use service names** - Always use `mysql` and `redis` (not `localhost`) in Docker
3. **Health checks** - Services wait for dependencies to be healthy
4. **Volumes** - Data persists in Docker volumes
5. **Security** - Change default passwords in production
6. **Documentation** - Keep `docker/README.md` updated

## 🔍 Verification

After setup, verify everything works:

```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs -f app

# Test API
curl http://localhost:8000/api/v1/health

# Or use verification script
bash docker/scripts/verify-setup.sh  # Linux/macOS
.\docker\scripts\verify-setup.ps1   # Windows
```
