#!/bin/bash
# LifeID Quick Start Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           LifeID - Healthcare Identity System             ║"
echo "║                   Integration Complete                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

# Install dependencies and start servers
echo "1️⃣  Starting Backend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend
npm install --silent 2>/dev/null && npm run dev &
BACKEND_PID=$!
sleep 2

echo ""
echo "2️⃣  Starting Frontend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd ../frontend
npm install --silent 2>/dev/null && npm run dev &
FRONTEND_PID=$!
sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Both servers started successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Access Application:"
echo "   → http://localhost:5173"
echo ""
echo "🔐 Test Credentials:"
echo "   • Admin:   admin@lifeid.gov.in / admin123"
echo "   • Doctor:  doctor@lifeid.gov.in / doctor123"
echo "   • Records: records@lifeid.gov.in / records123"
echo "   • Patient: patient@lifeid.gov.in / patient123"
echo ""
echo "📊 API Health Check:"
echo "   → http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for processes
wait

