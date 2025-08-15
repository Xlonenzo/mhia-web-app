#!/bin/bash

# MHIA Web App - Backup Script
# This script backs up the database and uploaded files

set -e

BACKUP_DIR="/var/backups/mhia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET=${S3_BUCKET:-"mhia-backups"}
RETENTION_DAYS=${RETENTION_DAYS:-30}

echo "========================================="
echo "MHIA Web App - Backup Script"
echo "Starting backup at $(date)"
echo "========================================="

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker-compose -f /opt/mhia-app/docker-compose.prod.yml exec -T postgres \
    pg_dump -U postgres mhia_db | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Backup uploaded files
echo "Backing up uploaded files..."
tar -czf $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz \
    -C /var/lib/mhia uploads

# Backup results files
echo "Backing up results files..."
tar -czf $BACKUP_DIR/results_backup_$TIMESTAMP.tar.gz \
    -C /var/lib/mhia results

# Upload to S3 if AWS CLI is configured
if command -v aws &> /dev/null && aws s3 ls s3://$S3_BUCKET 2>/dev/null; then
    echo "Uploading backups to S3..."
    aws s3 cp $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz \
        s3://$S3_BUCKET/database/db_backup_$TIMESTAMP.sql.gz
    aws s3 cp $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz \
        s3://$S3_BUCKET/uploads/uploads_backup_$TIMESTAMP.tar.gz
    aws s3 cp $BACKUP_DIR/results_backup_$TIMESTAMP.tar.gz \
        s3://$S3_BUCKET/results/results_backup_$TIMESTAMP.tar.gz
    echo "Backups uploaded to S3 successfully"
else
    echo "S3 upload skipped (AWS CLI not configured or bucket not accessible)"
fi

# Clean up old local backups
echo "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find $BACKUP_DIR -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Show backup summary
echo ""
echo "========================================="
echo "Backup Complete!"
echo "========================================="
echo "Database backup: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
echo "Uploads backup: $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"
echo "Results backup: $BACKUP_DIR/results_backup_$TIMESTAMP.tar.gz"
echo "Backup size: $(du -sh $BACKUP_DIR | cut -f1)"
echo "Completed at $(date)"