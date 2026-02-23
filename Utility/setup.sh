#!/bin/bash
# Quick setup script for RAG Eval Standalone Utility

set -e

echo "🚀 RAG Eval Standalone Utility - Setup"
echo "========================================"

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install pip."
    exit 1
fi
echo "✓ pip3 is available"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo "⚠️  Please edit .env and add your Azure OpenAI credentials"
else
    echo "✓ .env file already exists"
fi

# Make script executable
chmod +x rag_eval_standalone.py
echo "✓ Made script executable"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Azure OpenAI credentials"
echo "2. Run: python3 rag_eval_standalone.py sample_rag_input.xlsx"
echo ""
