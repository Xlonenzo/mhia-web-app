# Database Setup for MHIA Backend

## Issue Description
You're encountering a UTF-8 encoding error when connecting to PostgreSQL on Windows. This is common and can be resolved using several methods.

## Method 1: Manual Database Creation (Recommended)

### Using pgAdmin:
1. Open pgAdmin (usually installed with PostgreSQL)
2. Connect to your PostgreSQL server (localhost)
3. Right-click on "Databases" in the left panel
4. Select "Create" → "Database..."
5. Enter database name: `mhia`
6. In the "Definition" tab, set:
   - Encoding: `UTF8`
   - Template: `template0`
   - Collation: `English_United States.1252` (or your system's default)
7. Click "Save"

### Using SQL Commands:
If you have psql access, run:
```sql
CREATE DATABASE mhia 
WITH ENCODING 'UTF8' 
TEMPLATE template0 
LC_COLLATE = 'English_United States.1252' 
LC_CTYPE = 'English_United States.1252';
```

## Method 2: Command Line Setup

Run the batch script we created:
```cmd
cd backend
setup_db.bat
```

## Method 3: Check PostgreSQL Installation

### Verify PostgreSQL is running:
```cmd
netstat -an | findstr 5432
```
You should see PostgreSQL listening on port 5432.

### Check PostgreSQL service:
```cmd
sc query postgresql-x64-15
```
(Replace `15` with your PostgreSQL version)

### Start PostgreSQL if needed:
```cmd
net start postgresql-x64-15
```

## Method 4: Fix Password Issues

If you get authentication errors, reset postgres password:

1. Open Command Prompt as Administrator
2. Navigate to PostgreSQL bin directory:
   ```cmd
   cd "C:\Program Files\PostgreSQL\15\bin"
   ```
3. Connect and change password:
   ```cmd
   psql -U postgres
   ALTER USER postgres PASSWORD 'password';
   \q
   ```

## Method 5: Alternative Connection Strings

Try these alternatives in your `.env` file:

### Option 1 (current):
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/mhia?client_encoding=utf8
```

### Option 2:
```
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/mhia
```

### Option 3:
```
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/mhia
```

## Troubleshooting

### Common Issues:

1. **PostgreSQL not running**
   - Start the service: `net start postgresql-x64-15`
   - Check Windows Services for PostgreSQL

2. **Wrong password**
   - Reset postgres user password (see Method 4)
   - Check if you're using the correct credentials

3. **Port conflict**
   - Check if port 5432 is in use: `netstat -an | findstr 5432`
   - Change port in postgresql.conf if needed

4. **Encoding issues**
   - Ensure database is created with UTF8 encoding
   - Set client_encoding in connection string

### Environment Variables:
You can also set these environment variables:
```cmd
set PGCLIENTENCODING=UTF8
set PGUSER=postgres
set PGPASSWORD=password
set PGHOST=localhost
set PGPORT=5432
```

## Testing Connection

After setup, test the connection:

```bash
cd backend
python -c "
from app.core.database import engine
print('Testing database connection...')
try:
    with engine.connect() as conn:
        result = conn.execute('SELECT version()').fetchone()
        print(f'Connected successfully: {result[0][:50]}...')
except Exception as e:
    print(f'Connection failed: {e}')
"
```

## Next Steps

Once the database is set up:

1. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. The backend should start successfully at http://localhost:8000

## Need Help?

If you continue having issues:
1. Check the PostgreSQL logs (usually in PostgreSQL installation directory)
2. Verify your PostgreSQL installation is complete
3. Consider reinstalling PostgreSQL with default settings
4. Use the manual pgAdmin method as it's most reliable