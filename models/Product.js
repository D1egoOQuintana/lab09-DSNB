const { v4: uuidv4 } = require('uuid');

// Simulación de base de datos en memoria (para producción, usar MongoDB, PostgreSQL, etc.)
let products = [];

class Product {
  constructor(name, description, price, imageUrl, imageKey) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.imageKey = imageKey; // Key del archivo en S3
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Obtener todos los productos
  static getAll() {
    return products;
  }

  // Obtener producto por ID
  static getById(id) {
    return products.find(p => p.id === id);
  }

  // Crear producto
  static create(productData) {
    const newProduct = new Product(
      productData.name,
      productData.description,
      productData.price,
      productData.imageUrl,
      productData.imageKey
    );
    products.push(newProduct);
    return newProduct;
  }

  // Actualizar producto
  static update(id, productData) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date()
    };
    return products[index];
  }

  // Eliminar producto
  static delete(id) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const deleted = products[index];
    products.splice(index, 1);
    return deleted;
  }

  // Limpiar todos los productos (útil para testing)
  static clear() {
    products = [];
  }
}

module.exports = Product;
