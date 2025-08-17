#!/bin/bash

# Deploy RAG Pipeline Workers
# This script deploys all the workers for the RAG pipeline

set -e

echo "🚀 Deploying RAG Pipeline Workers..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists wrangler; then
    echo -e "${RED}❌ Wrangler CLI not found. Please install it with: npm install -g wrangler${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install Node.js and npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Apply database migrations
echo -e "\n${YELLOW}📊 Applying database migrations...${NC}"
cd ../alleato-backend
wrangler d1 migrations apply alleato --local=false
cd ../scripts

# Deploy Fireflies Ingest Worker
echo -e "\n${YELLOW}🔄 Deploying Fireflies Ingest Worker...${NC}"
cd ../workers/fireflies-ingest-worker
npm install
wrangler deploy

# Get the deployed URL
INGEST_URL=$(wrangler deployments list | grep -m1 "https://" | awk '{print $2}')
echo -e "${GREEN}✅ Fireflies Ingest Worker deployed at: $INGEST_URL${NC}"
cd ../../scripts

# Deploy Vectorize Worker
echo -e "\n${YELLOW}🧮 Deploying Vectorize Worker...${NC}"
cd ../workers/vectorize-worker
npm install

# Create Vectorize index if it doesn't exist
echo "Creating Vectorize index..."
wrangler vectorize create fireflies-transcripts --dimensions=768 --metric=cosine || echo "Index already exists"

wrangler deploy
echo -e "${GREEN}✅ Vectorize Worker deployed${NC}"
cd ../../scripts

# Deploy AI Agent Worker
echo -e "\n${YELLOW}🤖 Deploying AI Agent Worker...${NC}"
cd ../workers/ai-agent-worker
npm install
wrangler deploy

# Get the deployed URL
AGENT_URL=$(wrangler deployments list | grep -m1 "https://" | awk '{print $2}')
echo -e "${GREEN}✅ AI Agent Worker deployed at: $AGENT_URL${NC}"
cd ../../scripts

# Update main backend with worker URLs
echo -e "\n${YELLOW}🔧 Updating main backend configuration...${NC}"
cd ../alleato-backend

# Add worker URLs to wrangler.toml
cat >> wrangler.toml << EOF

[vars]
AI_AGENT_URL = "$AGENT_URL"
FIREFLIES_INGEST_URL = "$INGEST_URL"
EOF

# Deploy main backend with updated configuration
wrangler deploy
echo -e "${GREEN}✅ Main backend updated and deployed${NC}"
cd ../scripts

# Summary
echo -e "\n${GREEN}🎉 RAG Pipeline deployment complete!${NC}"
echo -e "\nDeployed services:"
echo -e "  • Fireflies Ingest Worker: $INGEST_URL"
echo -e "  • Vectorize Worker: (Queue-based, no public URL)"
echo -e "  • AI Agent Worker: $AGENT_URL"
echo -e "  • Main Backend: Updated with new routes"

echo -e "\n${YELLOW}⚠️  Important next steps:${NC}"
echo -e "1. Set the FIREFLIES_API_KEY secret:"
echo -e "   ${YELLOW}wrangler secret put FIREFLIES_API_KEY --env production${NC}"
echo -e ""
echo -e "2. Configure the cron schedule for Fireflies sync in production"
echo -e ""
echo -e "3. Monitor the workers:"
echo -e "   ${YELLOW}wrangler tail fireflies-ingest-worker${NC}"
echo -e "   ${YELLOW}wrangler tail vectorize-worker${NC}"
echo -e "   ${YELLOW}wrangler tail ai-agent-worker${NC}"

echo -e "\n${GREEN}✨ Your RAG pipeline is ready to use!${NC}"