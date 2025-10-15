const express = require('express');
const router = express.Router();
const S3Service = require('../services/s3Service');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const BACKUP_BUCKET_NAME = process.env.S3_BACKUP_BUCKET_NAME;

/**
 * GET /api/s3/files - Listar archivos en el bucket principal
 */
router.get('/files', async (req, res) => {
  try {
    const files = await S3Service.listFiles(BUCKET_NAME);
    res.json({
      success: true,
      bucket: BUCKET_NAME,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/s3/backup/files - Listar archivos en el bucket de backup
 */
router.get('/backup/files', async (req, res) => {
  try {
    const files = await S3Service.listFiles(BACKUP_BUCKET_NAME);
    res.json({
      success: true,
      bucket: BACKUP_BUCKET_NAME,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/s3/backup - Hacer backup del bucket principal
 */
router.post('/backup', async (req, res) => {
  try {
    const result = await S3Service.backupBucket(BUCKET_NAME, BACKUP_BUCKET_NAME);
    res.json({
      success: true,
      message: 'Backup completado',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/s3/restore - Restaurar desde el bucket de backup
 */
router.post('/restore', async (req, res) => {
  try {
    const { sourceBucket } = req.body;
    const backupBucket = sourceBucket || BACKUP_BUCKET_NAME;

    const result = await S3Service.restoreFromBackup(backupBucket, BUCKET_NAME);
    res.json({
      success: true,
      message: 'Restauración completada',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/s3/check-bucket - Verificar si un bucket existe
 */
router.post('/check-bucket', async (req, res) => {
  try {
    const { bucketName } = req.body;
    if (!bucketName) {
      return res.status(400).json({
        success: false,
        error: 'Nombre del bucket es requerido'
      });
    }

    const result = await S3Service.checkBucket(bucketName);
    res.json({
      success: true,
      bucket: bucketName,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/s3/config - Obtener configuración actual de buckets
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      mainBucket: BUCKET_NAME,
      backupBucket: BACKUP_BUCKET_NAME,
      region: process.env.AWS_REGION
    }
  });
});

module.exports = router;
