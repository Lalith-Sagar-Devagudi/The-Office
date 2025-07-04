#!/bin/bash

# The Office - Docker Runner Script
# This script helps you easily run both frontend and backend using Docker

echo "🏢 The Office - Docker Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available (try both new and old commands)
DOCKER_COMPOSE_CMD=""
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

print_status "Using Docker Compose command: $DOCKER_COMPOSE_CMD"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    print_warning ".env file not found in backend directory"
    echo "Please create backend/.env with your OPENAI_API_KEY"
    echo "Example:"
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    exit 1
fi

print_status "Checking for running containers..."

# Stop any existing containers
if $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
    print_status "Stopping existing containers..."
    $DOCKER_COMPOSE_CMD down
fi

print_status "Building and starting services..."

# Build and start services
if $DOCKER_COMPOSE_CMD up --build -d; then
    print_success "Services started successfully!"
    echo ""
    echo "🚀 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8001"
    echo "   API Docs: http://localhost:8001/docs"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: $DOCKER_COMPOSE_CMD logs"
    echo "   Stop services: $DOCKER_COMPOSE_CMD down"
    echo "   Restart: $DOCKER_COMPOSE_CMD restart"
    echo ""
    print_status "Showing live logs (Ctrl+C to exit)..."
    echo ""
    $DOCKER_COMPOSE_CMD logs -f
else
    print_error "Failed to start services. Check the logs above."
    exit 1
fi 