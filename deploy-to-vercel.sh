#!/bin/bash

# CharismaAI - Vercel Deployment Script
# Developed by Mohamed Abdelrazig - MAAM

echo "🚀 CharismaAI - Deploying to Vercel"
echo "Developed by Mohamed Abdelrazig - MAAM"
echo "=================================="

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check current deployment status
print_status "Checking current deployment status..."
HEALTH_STATUS=$(curl -s https://charismaai.vercel.app/api/health | grep -o '"status":"[^"]*' | cut -d'"' -f4)
print_status "Current status: $HEALTH_STATUS"

# Commit current changes
print_status "Committing latest changes..."
git add .
git commit -m "feat: production-ready version with signature and optimizations - Developed by Mohamed Abdelrazig - MAAM" || print_warning "No changes to commit"

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    print_success "Deployment successful!"
else
    print_error "Deployment failed!"
    exit 1
fi

# Wait for deployment to be ready
print_status "Waiting for deployment to be ready..."
sleep 10

# Check health after deployment
print_status "Checking post-deployment health..."
HEALTH_RESPONSE=$(curl -s https://charismaai.vercel.app/api/health)
NEW_STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
TEMPLATE_COUNT=$(echo $HEALTH_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)
COMPLIANCE=$(echo $HEALTH_RESPONSE | grep -o '"compliance":"[^"]*' | cut -d'"' -f4)

echo ""
echo "📊 Deployment Summary"
echo "===================="
echo "🌐 URL: https://charismaai.vercel.app"
echo "📈 Status: $NEW_STATUS"
echo "📋 Templates: $TEMPLATE_COUNT"
echo "✅ Compliance: $COMPLIANCE"
echo ""

if [ "$NEW_STATUS" = "healthy" ]; then
    print_success "🎉 Deployment successful! Your CharismaAI platform is live and healthy."
    echo ""
    echo "🔗 Quick Links:"
    echo "   • Platform: https://charismaai.vercel.app"
    echo "   • Health Check: https://charismaai.vercel.app/api/health"
    echo "   • Documentation: https://charismaai.vercel.app/docs"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Test the analysis functionality"
    echo "   2. Verify all 10 templates are working"
    echo "   3. Check the comprehensive documentation"
    echo "   4. Set up monitoring and analytics"
elif [ "$NEW_STATUS" = "degraded" ]; then
    print_warning "⚠️  Deployment successful but system is degraded."
    echo ""
    echo "🔧 Possible Issues:"
    echo "   • Templates may need seeding"
    echo "   • Database connection issues"
    echo "   • Environment variables missing"
    echo ""
    echo "🛠️  Troubleshooting:"
    echo "   1. Check Vercel dashboard for logs"
    echo "   2. Verify environment variables are set"
    echo "   3. Run database migrations if needed"
    echo "   4. Check the deployment guide: VERCEL_DEPLOYMENT_GUIDE.md"
else
    print_error "❌ Deployment completed but system is unhealthy."
    echo ""
    echo "🔍 Debug Information:"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
    echo ""
    echo "📖 Check the troubleshooting guide in VERCEL_DEPLOYMENT_GUIDE.md"
fi

echo ""
echo "👨‍💻 Developed by Mohamed Abdelrazig - MAAM"
echo "📚 For support, check the comprehensive documentation in this repository"