const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const S3Service = require('../services/s3Service');
const upload = require('../config/multer');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * GET /api/products - Obtener todos los productos
 */
router.get('/', (req, res) => {
  try {
    const products = Product.getAll();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/products/:id - Obtener un producto por ID
 */
router.get('/:id', (req, res) => {
  try {
    const product = Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/products - Crear un nuevo producto
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Validaciones
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y precio son requeridos'
      });
    }

    let imageUrl = null;
    let imageKey = null;

    // Si hay imagen, subirla a S3
    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, BUCKET_NAME);
      imageUrl = uploadResult.url;
      imageKey = uploadResult.key;
    }

    // Crear producto
    const product = Product.create({
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      imageKey
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/products/:id - Actualizar un producto
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const product = Product.getById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    let imageUrl = product.imageUrl;
    let imageKey = product.imageKey;

    // Si hay nueva imagen, eliminar la anterior y subir la nueva
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (product.imageKey) {
        try {
          await S3Service.deleteFile(product.imageKey, BUCKET_NAME);
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
        }
      }

      // Subir nueva imagen
      const uploadResult = await S3Service.uploadFile(req.file, BUCKET_NAME);
      imageUrl = uploadResult.url;
      imageKey = uploadResult.key;
    }

    // Actualizar producto
    const updatedProduct = Product.update(req.params.id, {
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      imageUrl,
      imageKey
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/products/:id - Eliminar un producto
 */
router.delete('/:id', async (req, res) => {
  try {
    const product = Product.getById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Eliminar imagen de S3 si existe
    if (product.imageKey) {
      try {
        await S3Service.deleteFile(product.imageKey, BUCKET_NAME);
      } catch (error) {
        console.error('Error al eliminar imagen de S3:', error);
      }
    }

    // Eliminar producto
    Product.delete(req.params.id);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
