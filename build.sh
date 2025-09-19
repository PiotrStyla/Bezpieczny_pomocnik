#!/bin/bash
echo "=== Build Debug Info ==="
echo "Python version requested: $(cat runtime.txt)"
echo "Python version actual: $(python --version)"
echo "Python path: $(which python)"
echo "Pip version: $(pip --version)"
echo "========================"

echo "Installing requirements..."
pip install -r backend/requirements.txt
