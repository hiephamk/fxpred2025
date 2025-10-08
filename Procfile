web: cd /opt/render/project/src && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
web: python manage.py collectstatic --noinput && python manage.py migrate && gunicorn backend.wsgi
