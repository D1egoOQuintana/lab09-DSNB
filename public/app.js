// API Base URL
const API_URL = window.location.origin + '/api';

let editingProductId = null;

// ========== UTILITY FUNCTIONS ==========

function showLoading(show = true) {
  const loading = document.getElementById('loading');
  if (show) {
    loading.classList.add('show');
  } else {
    loading.classList.remove('show');
  }
}

function showTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Mostrar el tab seleccionado
  document.getElementById(`${tabName}-tab`).classList.add('active');
  event.target.classList.add('active');

  // Cargar datos según el tab
  if (tabName === 'products') {
    loadProducts();
  } else if (tabName === 'backup') {
    loadBucketConfig();
  }
}

function showResult(elementId, message, type = 'info') {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `result-box ${type}`;
  element.style.display = 'block';

  // Ocultar después de 5 segundos
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('es-ES');
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========== PRODUCTS FUNCTIONS ==========

async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/products`);
    const result = await response.json();

    const container = document.getElementById('products-list');
    
    if (result.success && result.data.length > 0) {
      container.innerHTML = result.data.map(product => `
        <div class="product-card">
          ${product.imageUrl 
            ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-image">`
            : '<div class="product-image" style="display: flex; align-items: center; justify-content: center; background: #e0e0e0;"><span style="font-size: 3rem;">📦</span></div>'
          }
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description || 'Sin descripción'}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
              <button class="btn btn-primary" onclick="editProduct('${product.id}')">✏️ Editar</button>
              <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">🗑️ Eliminar</button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div style="font-size: 4rem;">📦</div>
          <h3>No hay productos</h3>
          <p>Agrega tu primer producto usando el formulario arriba</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error al cargar productos:', error);
    alert('Error al cargar productos');
  } finally {
    showLoading(false);
  }
}

async function editProduct(id) {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const result = await response.json();

    if (result.success) {
      const product = result.data;
      document.getElementById('product-id').value = product.id;
      document.getElementById('name').value = product.name;
      document.getElementById('description').value = product.description || '';
      document.getElementById('price').value = product.price;
      
      editingProductId = product.id;
      
      // Scroll al formulario
      document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error al cargar producto:', error);
    alert('Error al cargar producto');
  } finally {
    showLoading(false);
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) {
    return;
  }

  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();

    if (result.success) {
      alert('✅ Producto eliminado exitosamente');
      loadProducts();
    } else {
      alert('❌ Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    alert('Error al eliminar producto');
  } finally {
    showLoading(false);
  }
}

function resetForm() {
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  editingProductId = null;
}

// ========== BACKUP & RESTORE FUNCTIONS ==========

async function loadBucketConfig() {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/s3/config`);
    const result = await response.json();

    if (result.success) {
      const config = result.data;
      document.getElementById('bucket-config').innerHTML = `
        <p><strong>🗄️ Bucket Principal:</strong> ${config.mainBucket}</p>
        <p><strong>💾 Bucket de Backup:</strong> ${config.backupBucket}</p>
        <p><strong>🌍 Región:</strong> ${config.region}</p>
      `;
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error);
  } finally {
    showLoading(false);
  }
}

async function performBackup() {
  if (!confirm('¿Realizar backup del bucket principal?')) {
    return;
  }

  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/s3/backup`, {
      method: 'POST'
    });
    const result = await response.json();

    if (result.success) {
      const data = result.data;
      showResult('backup-result', 
        `✅ Backup completado\n` +
        `Total: ${data.totalFiles} archivos\n` +
        `Exitosos: ${data.successful}\n` +
        `Fallidos: ${data.failed}`,
        'success'
      );
    } else {
      showResult('backup-result', `❌ Error: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error en backup:', error);
    showResult('backup-result', `❌ Error: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

async function performRestore() {
  const customBucket = document.getElementById('restore-bucket').value.trim();
  
  if (!confirm('¿Restaurar archivos al bucket principal? Esto sobrescribirá archivos existentes.')) {
    return;
  }

  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/s3/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceBucket: customBucket || undefined
      })
    });
    const result = await response.json();

    if (result.success) {
      const data = result.data;
      showResult('restore-result',
        `✅ Restauración completada\n` +
        `Total: ${data.totalFiles} archivos\n` +
        `Exitosos: ${data.successful}\n` +
        `Fallidos: ${data.failed}`,
        'success'
      );
    } else {
      showResult('restore-result', `❌ Error: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error en restauración:', error);
    showResult('restore-result', `❌ Error: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

async function listBucketFiles(type) {
  showLoading(true);
  try {
    const endpoint = type === 'main' ? '/s3/files' : '/s3/backup/files';
    const response = await fetch(`${API_URL}${endpoint}`);
    const result = await response.json();

    const container = document.getElementById('files-list');

    if (result.success && result.data.length > 0) {
      container.innerHTML = `
        <h3 style="margin-bottom: 15px;">📁 ${result.bucket} (${result.count} archivos)</h3>
        ${result.data.map(file => `
          <div class="file-item">
            <div class="file-info">
              <div class="file-name">${file.key}</div>
              <div class="file-meta">
                Tamaño: ${formatFileSize(file.size)} | 
                Modificado: ${formatDate(file.lastModified)}
              </div>
            </div>
            <a href="${file.url}" target="_blank" class="btn btn-secondary">Ver</a>
          </div>
        `).join('')}
      `;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 3rem;">📁</div>
          <p>No hay archivos en este bucket</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error al listar archivos:', error);
    document.getElementById('files-list').innerHTML = `
      <div class="result-box error">
        Error al listar archivos: ${error.message}
      </div>
    `;
  } finally {
    showLoading(false);
  }
}

// ========== EVENT LISTENERS ==========

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('price', document.getElementById('price').value);
  
  const imageFile = document.getElementById('image').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  showLoading(true);

  try {
    const productId = document.getElementById('product-id').value;
    const url = productId 
      ? `${API_URL}/products/${productId}`
      : `${API_URL}/products`;
    
    const method = productId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ Producto ${productId ? 'actualizado' : 'creado'} exitosamente`);
      resetForm();
      loadProducts();
    } else {
      alert('❌ Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar producto');
  } finally {
    showLoading(false);
  }
});

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});
