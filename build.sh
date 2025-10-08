#!/usr/bin/env bash
set -e
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..
echo "Copying index.html to templates..."
mkdir -p backend/templates
cp frontend/build/index.html backend/templates/index.html
echo "Running migrations..."
python manage.py migrate --noinput
echo "Collecting static files..."
python manage.py collectstatic --noinput
echo "Training model..."
python manage.py shell -c "from myfx.views import train_model; train_model(epochs=500)"