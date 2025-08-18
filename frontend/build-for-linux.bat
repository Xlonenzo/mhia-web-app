@echo off
echo Building frontend for Linux deployment...

REM Build locally
call npm run build

REM Create deployment package
echo Creating deployment package...
if exist deploy-package rmdir /s /q deploy-package
mkdir deploy-package

REM Copy built files
xcopy /E /I dist deploy-package\dist

REM Create simple server script
echo const express = require('express'); > deploy-package\server.js
echo const path = require('path'); >> deploy-package\server.js
echo const app = express(); >> deploy-package\server.js
echo app.use(express.static(path.join(__dirname, 'dist'))); >> deploy-package\server.js
echo app.get('*', (req, res) =^> { >> deploy-package\server.js
echo   res.sendFile(path.join(__dirname, 'dist', 'index.html')); >> deploy-package\server.js
echo }); >> deploy-package\server.js
echo const PORT = process.env.PORT ^|^| 3000; >> deploy-package\server.js
echo app.listen(PORT, '0.0.0.0', () =^> { >> deploy-package\server.js
echo   console.log(`Server running on port ${PORT}`); >> deploy-package\server.js
echo }); >> deploy-package\server.js

REM Create package.json for server
echo { > deploy-package\package.json
echo   "name": "mhia-frontend-static", >> deploy-package\package.json
echo   "version": "1.0.0", >> deploy-package\package.json
echo   "scripts": { >> deploy-package\package.json
echo     "start": "node server.js" >> deploy-package\package.json
echo   }, >> deploy-package\package.json
echo   "dependencies": { >> deploy-package\package.json
echo     "express": "^4.18.2" >> deploy-package\package.json
echo   } >> deploy-package\package.json
echo } >> deploy-package\package.json

echo.
echo Build complete! Deploy the 'deploy-package' folder to Linux server.
echo On Linux server, run:
echo   cd deploy-package
echo   npm install
echo   npm start