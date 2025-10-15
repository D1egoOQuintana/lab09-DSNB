const { s3 } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class S3Service {
  /**
   * Subir archivo a S3
   */
  static async uploadFile(file, bucketName) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' // Para que las imágenes sean accesibles públicamente
    };

    try {
      const result = await s3.upload(params).promise();
      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket
      };
    } catch (error) {
      console.error('Error al subir archivo a S3:', error);
      throw new Error('Error al subir la imagen a S3');
    }
  }

  /**
   * Eliminar archivo de S3
   */
  static async deleteFile(key, bucketName) {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
      return { success: true, key };
    } catch (error) {
      console.error('Error al eliminar archivo de S3:', error);
      throw new Error('Error al eliminar la imagen de S3');
    }
  }

  /**
   * Listar archivos en un bucket
   */
  static async listFiles(bucketName) {
    const params = {
      Bucket: bucketName
    };

    try {
      const data = await s3.listObjectsV2(params).promise();
      return data.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: `https://${bucketName}.s3.amazonaws.com/${item.Key}`
      }));
    } catch (error) {
      console.error('Error al listar archivos:', error);
      throw new Error('Error al listar archivos del bucket');
    }
  }

  /**
   * Copiar archivo entre buckets
   */
  static async copyFile(sourceKey, sourceBucket, destinationBucket) {
    const params = {
      Bucket: destinationBucket,
      CopySource: `${sourceBucket}/${sourceKey}`,
      Key: sourceKey,
      ACL: 'public-read'
    };

    try {
      const result = await s3.copyObject(params).promise();
      return {
        success: true,
        key: sourceKey,
        url: `https://${destinationBucket}.s3.amazonaws.com/${sourceKey}`
      };
    } catch (error) {
      console.error('Error al copiar archivo:', error);
      throw new Error('Error al copiar archivo entre buckets');
    }
  }

  /**
   * Hacer backup de todos los archivos del bucket principal al bucket de backup
   */
  static async backupBucket(sourceBucket, backupBucket) {
    try {
      const files = await this.listFiles(sourceBucket);
      const results = [];

      for (const file of files) {
        try {
          const result = await this.copyFile(file.key, sourceBucket, backupBucket);
          results.push({ ...result, originalKey: file.key });
        } catch (error) {
          results.push({ 
            success: false, 
            key: file.key, 
            error: error.message 
          });
        }
      }

      return {
        totalFiles: files.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results
      };
    } catch (error) {
      console.error('Error en backup:', error);
      throw new Error('Error al realizar el backup');
    }
  }

  /**
   * Restaurar archivos desde el bucket de backup al bucket principal
   */
  static async restoreFromBackup(backupBucket, targetBucket) {
    try {
      const files = await this.listFiles(backupBucket);
      const results = [];

      for (const file of files) {
        try {
          const result = await this.copyFile(file.key, backupBucket, targetBucket);
          results.push({ ...result, originalKey: file.key });
        } catch (error) {
          results.push({ 
            success: false, 
            key: file.key, 
            error: error.message 
          });
        }
      }

      return {
        totalFiles: files.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results
      };
    } catch (error) {
      console.error('Error en restauración:', error);
      throw new Error('Error al restaurar desde backup');
    }
  }

  /**
   * Verificar si un bucket existe y es accesible
   */
  static async checkBucket(bucketName) {
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
      return { exists: true, accessible: true };
    } catch (error) {
      if (error.statusCode === 404) {
        return { exists: false, accessible: false };
      }
      return { exists: true, accessible: false, error: error.message };
    }
  }
}

module.exports = S3Service;
