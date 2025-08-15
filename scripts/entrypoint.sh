#!/bin/bash

# Wait for postgres
echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Wait for redis
echo "Waiting for redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis started"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Create initial superuser if it doesn't exist
echo "Creating initial superuser..."
python -c "
from app.core.database import SessionLocal
from app.core.auth import create_user
from app.models.models import User

db = SessionLocal()
try:
    # Check if admin user exists
    admin = db.query(User).filter(User.username == 'admin').first()
    if not admin:
        admin_user = User(
            email='admin@mhia.com',
            username='admin',
            full_name='MHIA Administrator',
            hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  # admin123
            is_active=True,
            is_superuser=True
        )
        db.add(admin_user)
        db.commit()
        print('Admin user created successfully')
    else:
        print('Admin user already exists')
except Exception as e:
    print(f'Error creating admin user: {e}')
finally:
    db.close()
"

exec "$@"