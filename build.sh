#!/usr/bin/env bash
set -e  # Exit on error
echo "Running migrations..."
python manage.py migrate --noinput
echo "Collecting static files..."
python manage.py collectstatic --noinput