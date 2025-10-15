# 📦 Sistema de Gestión de Productos con AWS S3

Aplicación web completa para gestionar productos con almacenamiento de imágenes en AWS S3, sistema de backup y restauración.

## 🚀 Características

- ✅ **CRUD completo de productos** (Crear, Leer, Actualizar, Eliminar)
- 📸 **Almacenamiento de imágenes en AWS S3**
- 💾 **Sistema de backup automático** de buckets
- ♻️ **Restauración desde buckets de backup**
- 🎨 **Interfaz web moderna y responsiva**
- 🔐 **Configuración de buckets personalizable**

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- Cuenta de AWS con acceso a S3
- Dos buckets de S3 creados (principal y backup)

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales de AWS:

```env
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1

S3_BUCKET_NAME=tu-bucket-principal
S3_BACKUP_BUCKET_NAME=tu-bucket-backup

PORT=3000
```

### 3. Crear buckets en AWS S3

1. Inicia sesión en AWS Console
2. Ve a S3
3. Crea dos buckets:
   - Bucket principal (ej: `mi-app-productos`)
   - Bucket de backup (ej: `mi-app-productos-backup`)
4. Configura los permisos para permitir acceso público a objetos

**Política de bucket recomendada:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nombre-de-tu-bucket/*"
    }
  ]
}
```

### 4. Crear credenciales IAM

1. Ve a IAM en AWS Console
2. Crea un nuevo usuario con acceso programático
3. Asigna la política `AmazonS3FullAccess`
4. Guarda el Access Key ID y Secret Access Key

## 🚀 Ejecutar la aplicación

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 📦 Despliegue en Render

### 1. Preparar el repositorio

Asegúrate de que tu código esté en un repositorio de GitHub.

### 2. Crear servicio en Render

1. Ve a [Render.com](https://render.com) y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:

**Configuración:**
- **Name:** `product-manager-s3` (o el nombre que prefieras)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (o el que prefieras)

### 3. Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tu-bucket-principal
S3_BACKUP_BUCKET_NAME=tu-bucket-backup
NODE_ENV=production
```

### 4. Desplegar

Click en "Create Web Service" y espera a que se complete el despliegue.

Tu aplicación estará disponible en: `https://tu-app.onrender.com`

## 📖 Uso de la Aplicación

### Gestión de Productos

1. **Crear producto:**
   - Completa el formulario con nombre, descripción y precio
   - Opcionalmente, sube una imagen
   - Click en "Guardar"

2. **Editar producto:**
   - Click en "Editar" en la tarjeta del producto
   - Modifica los campos deseados
   - Click en "Guardar"

3. **Eliminar producto:**
   - Click en "Eliminar" en la tarjeta del producto
   - Confirma la eliminación

### Backup y Restauración

1. **Hacer Backup:**
   - Ve a la pestaña "Backup & Restore"
   - Click en "Hacer Backup"
   - Todos los archivos del bucket principal se copiarán al bucket de backup

2. **Restaurar desde Backup:**
   - Ve a la pestaña "Backup & Restore"
   - Opcionalmente, especifica un bucket de origen diferente
   - Click en "Restaurar"
   - Los archivos se copiarán al bucket principal

3. **Ver archivos:**
   - Click en "Ver Bucket Principal" o "Ver Bucket Backup"
   - Verás la lista de archivos con sus detalles

## 🔧 API Endpoints

### Productos

- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### S3

- `GET /api/s3/config` - Obtener configuración de buckets
- `GET /api/s3/files` - Listar archivos del bucket principal
- `GET /api/s3/backup/files` - Listar archivos del bucket de backup
- `POST /api/s3/backup` - Hacer backup
- `POST /api/s3/restore` - Restaurar desde backup
- `POST /api/s3/check-bucket` - Verificar si un bucket existe

## 🛡️ Seguridad

- Nunca compartas tus credenciales de AWS
- No subas el archivo `.env` a GitHub
- Usa IAM roles con permisos mínimos necesarios
- Considera usar AWS Secrets Manager para credenciales en producción

## 📝 Notas

- Los productos se almacenan en memoria (para producción, usa una base de datos)
- Las imágenes se almacenan en S3 con acceso público
- El límite de tamaño de imagen es 5MB
- Formatos de imagen soportados: JPG, PNG, GIF, WEBP

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, crea un issue o pull request.

## 📄 Licencia

ISC

---

Desarrollado con ❤️ usando Node.js, Express y AWS S3
