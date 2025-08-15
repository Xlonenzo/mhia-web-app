# MHIA Web App - Update Environment Files (PowerShell)
# This script updates .env files with generated secrets

param(
    [string]$SecretsFile = "deployment-secrets.txt",
    [string]$Domain = "",
    [switch]$WhatIf = $false
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "⚙️  MHIA Environment Files Updater" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host

# Check if secrets file exists
if (-not (Test-Path $SecretsFile)) {
    Write-Host "❌ Secrets file not found: $SecretsFile" -ForegroundColor Red
    Write-Host "Run generate-secrets.ps1 first to create the secrets file." -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Reading secrets from: $SecretsFile" -ForegroundColor Green

# Parse secrets from file
$secrets = @{}
Get-Content $SecretsFile | ForEach-Object {
    if ($_ -match '^([A-Z_]+)=(.+)$') {
        $secrets[$matches[1]] = $matches[2]
    }
}

# Validate required secrets
$requiredSecrets = @('DB_PASSWORD', 'JWT_SECRET_KEY')
$missing = @()

foreach ($secret in $requiredSecrets) {
    if (-not $secrets.ContainsKey($secret) -or $secrets[$secret] -like "*your_*" -or $secrets[$secret] -like "*xxx*") {
        $missing += $secret
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Missing or invalid secrets:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host "Please check your secrets file and regenerate if needed." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ All required secrets found" -ForegroundColor Green
Write-Host

# Function to update file with secrets
function Update-EnvFile {
    param(
        [string]$FilePath,
        [hashtable]$Secrets,
        [string]$Domain = "",
        [switch]$WhatIf = $false
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "⚠️  File not found: $FilePath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📝 Updating: $FilePath" -ForegroundColor Cyan
    
    $content = Get-Content $FilePath
    $updates = @()
    
    foreach ($line in $content) {
        $originalLine = $line
        
        # Update database password
        if ($line -match '^DB_PASSWORD=') {
            $line = "DB_PASSWORD=$($Secrets['DB_PASSWORD'])"
            $updates += "DB_PASSWORD"
        }
        elseif ($line -match '^JWT_SECRET_KEY=') {
            $line = "JWT_SECRET_KEY=$($Secrets['JWT_SECRET_KEY'])"
            $updates += "JWT_SECRET_KEY"
        }
        elseif ($line -match '^DATABASE_URL=.*password@') {
            $line = $line -replace ':password@', ":$($Secrets['DB_PASSWORD'])@"
            $updates += "DATABASE_URL"
        }
        # Update domain references
        elseif ($Domain -and $line -match 'your-domain\.com') {
            $line = $line -replace 'your-domain\.com', $Domain
            $updates += "Domain references"
        }
        elseif ($Domain -and $line -match 'https://your-domain\.com') {
            $line = $line -replace 'https://your-domain\.com', "https://$Domain"
            $updates += "API URL"
        }
        
        if ($WhatIf -and $line -ne $originalLine) {
            Write-Host "   Would change: $originalLine" -ForegroundColor Gray
            Write-Host "   To:           $line" -ForegroundColor Gray
        }
        
        $line
    } | Set-Content $FilePath -WhatIf:$WhatIf
    
    if ($updates.Count -gt 0) {
        Write-Host "   ✓ Updated: $($updates -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  No changes needed" -ForegroundColor Blue
    }
}

# Update .env.production
$envProdPath = "../../.env.production"
if (Test-Path $envProdPath) {
    Update-EnvFile -FilePath $envProdPath -Secrets $secrets -Domain $Domain -WhatIf:$WhatIf
} else {
    Write-Host "⚠️  .env.production not found at: $envProdPath" -ForegroundColor Yellow
}

# Update backend .env if it exists
$backendEnvPath = "../../backend/.env"
if (Test-Path $backendEnvPath) {
    Write-Host
    Update-EnvFile -FilePath $backendEnvPath -Secrets $secrets -Domain $Domain -WhatIf:$WhatIf
} else {
    Write-Host "ℹ️  Backend .env not found (this is normal for production)" -ForegroundColor Blue
}

Write-Host
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 Docker Compose Update" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Update docker-compose.prod.yml
$dockerComposePath = "../../docker-compose.prod.yml"
if (Test-Path $dockerComposePath) {
    Write-Host "📝 Checking Docker Compose configuration..." -ForegroundColor Cyan
    
    $dockerContent = Get-Content $dockerComposePath -Raw
    
    if ($dockerContent -match '\$\{DB_PASSWORD\}') {
        Write-Host "   ✓ Docker Compose uses environment variables (recommended)" -ForegroundColor Green
        Write-Host "   Make sure to set DB_PASSWORD in your .env file" -ForegroundColor Yellow
    } else {
        Write-Host "   ℹ️  Docker Compose uses hardcoded values" -ForegroundColor Blue
    }
} else {
    Write-Host "⚠️  docker-compose.prod.yml not found" -ForegroundColor Yellow
}

Write-Host
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🎉 Environment Update Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host

if ($WhatIf) {
    Write-Host "This was a dry run. Remove -WhatIf to make actual changes." -ForegroundColor Yellow
    Write-Host
}

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. 🔍 Review the updated files to ensure correctness" -ForegroundColor White
Write-Host "2. 🔐 Add secrets to GitHub repository settings" -ForegroundColor White  
Write-Host "3. ☁️  Create AWS infrastructure" -ForegroundColor White
Write-Host "4. 🚀 Deploy to EC2" -ForegroundColor White
Write-Host

Write-Host "Security reminders:" -ForegroundColor Red
Write-Host "- Never commit .env files with real secrets to Git" -ForegroundColor Red
Write-Host "- Use different secrets for different environments" -ForegroundColor Red
Write-Host "- Rotate secrets periodically" -ForegroundColor Red
Write-Host