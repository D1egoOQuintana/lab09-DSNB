# 🎯 GUÍA PASO A PASO - ¿Qué tienes que hacer tú?

## ✅ PASO 1: Instalar Node.js (si no lo tienes)

1. Ve a https://nodejs.org/
2. Descarga la versión LTS (Long Term Support)
3. Instala siguiendo el asistente
4. Verifica la instalación abriendo PowerShell y ejecutando:
   ```powershell
   node --version
   npm --version
   ```

## ✅ PASO 2: Crear cuenta en AWS (si no la tienes)

1. Ve a https://aws.amazon.com/
2. Click en "Create an AWS Account"
3. Completa el registro (necesitarás tarjeta de crédito, pero S3 tiene capa gratuita)
4. Activa tu cuenta

## ✅ PASO 3: Crear Buckets de S3

### 3.1 Acceder a S3
1. Inicia sesión en AWS Console (https://console.aws.amazon.com)
2. Busca "S3" en la barra de búsqueda
3. Click en "S3"

### 3.2 Crear Bucket Principal
1. Click en "Create bucket"
2. **Bucket name:** `mi-app-productos-2024` (debe ser único globalmente)
3. **AWS Region:** US East (N. Virginia) us-east-1
4. **Block Public Access:** ⚠️ DESMARCAR "Block all public access"
5. ✅ Marcar "I acknowledge that..."
6. Click "Create bucket"

### 3.3 Configurar permisos del bucket principal
1. Click en el bucket que acabas de crear
2. Ve a la pestaña "Permissions"
3. Scroll hasta "Bucket policy"
4. Click "Edit"
5. Pega este JSON (reemplaza `mi-app-productos-2024` con tu nombre de bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mi-app-productos-2024/*"
    }
  ]
}
```

6. Click "Save changes"

### 3.4 Crear Bucket de Backup
1. Repite los pasos 3.2 y 3.3 pero con el nombre: `mi-app-productos-backup-2024`

## ✅ PASO 4: Crear credenciales IAM

### 4.1 Acceder a IAM
1. En AWS Console, busca "IAM" en la barra de búsqueda
2. Click en "IAM"

### 4.2 Crear usuario
1. Click en "Users" en el menú lateral
2. Click en "Create user"
3. **User name:** `app-productos-user`
4. Click "Next"

### 4.3 Asignar permisos
1. Selecciona "Attach policies directly"
2. Busca y selecciona: **AmazonS3FullAccess**
3. Click "Next"
4. Click "Create user"

### 4.4 Crear Access Key
1. Click en el usuario que acabas de crear
2. Ve a la pestaña "Security credentials"
3. Scroll hasta "Access keys"
4. Click "Create access key"
5. Selecciona "Application running outside AWS"
6. Click "Next"
7. Click "Create access key"
8. ⚠️ **MUY IMPORTANTE:** Copia y guarda en un lugar seguro:
   - **Access key ID**
   - **Secret access key**
   
   ⚠️ No podrás ver el Secret access key de nuevo!

## ✅ PASO 5: Configurar tu proyecto local

### 5.1 Abrir terminal en VS Code
1. En VS Code, presiona `` Ctrl + ` `` (backtick)
2. O ve a Terminal > New Terminal

### 5.2 Navegar a la carpeta del proyecto
```powershell
cd c:\Users\Luis\lab09
```

### 5.3 Instalar dependencias
```powershell
npm install
```

Esto instalará todas las librerías necesarias (Express, AWS SDK, Multer, etc.)

### 5.4 Crear archivo .env
1. Copia el archivo de ejemplo:
```powershell
copy .env.example .env
```

2. Abre el archivo `.env` en VS Code

3. Reemplaza los valores con tus credenciales:
```env
AWS_ACCESS_KEY_ID=tu_access_key_que_copiaste
AWS_SECRET_ACCESS_KEY=tu_secret_key_que_copiaste
AWS_REGION=us-east-1

S3_BUCKET_NAME=mi-app-productos-2024
S3_BACKUP_BUCKET_NAME=mi-app-productos-backup-2024

PORT=3000
NODE_ENV=development
```

4. Guarda el archivo

## ✅ PASO 6: Probar la aplicación localmente

### 6.1 Iniciar el servidor
```powershell
npm start
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 3000
📱 Frontend: http://localhost:3000
🔧 API: http://localhost:3000/api
```

### 6.2 Probar en el navegador
1. Abre tu navegador
2. Ve a: http://localhost:3000
3. Deberías ver la interfaz de la aplicación

### 6.3 Probar funcionalidades
1. **Crear un producto:**
   - Completa el formulario
   - Selecciona una imagen
   - Click en "Guardar"
   - Verifica que aparezca en la lista

2. **Probar Backup:**
   - Ve a la pestaña "Backup & Restore"
   - Click en "Hacer Backup"
   - Verifica el mensaje de éxito

3. **Ver archivos en S3:**
   - Click en "Ver Bucket Principal"
   - Deberías ver las imágenes subidas

## ✅ PASO 7: Subir a GitHub

### 7.1 Inicializar Git (si no está inicializado)
```powershell
git init
git add .
git commit -m "Initial commit - Product Manager con S3"
```

### 7.2 Crear repositorio en GitHub
1. Ve a https://github.com
2. Click en "+" > "New repository"
3. **Repository name:** `product-manager-s3`
4. Marca como "Private" (recomendado para credenciales)
5. Click "Create repository"

### 7.3 Subir código
```powershell
git remote add origin https://github.com/TU_USUARIO/product-manager-s3.git
git branch -M main
git push -u origin main
```

## ✅ PASO 8: Desplegar en Render

### 8.1 Crear cuenta en Render
1. Ve a https://render.com
2. Regístrate con GitHub (más fácil)

### 8.2 Crear Web Service
1. Click en "New +" > "Web Service"
2. Click en "Connect account" para conectar GitHub
3. Autoriza a Render
4. Selecciona tu repositorio `product-manager-s3`
5. Click "Connect"

### 8.3 Configurar el servicio
**Configuración:**
- **Name:** `product-manager-s3` (o el que quieras)
- **Region:** Oregon (US West) o el más cercano
- **Branch:** `main`
- **Root Directory:** (dejar vacío)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### 8.4 Agregar Variables de Entorno
1. Scroll hasta "Environment Variables"
2. Click en "Add Environment Variable"
3. Agrega una por una:

```
AWS_ACCESS_KEY_ID = tu_access_key
AWS_SECRET_ACCESS_KEY = tu_secret_key
AWS_REGION = us-east-1
S3_BUCKET_NAME = mi-app-productos-2024
S3_BACKUP_BUCKET_NAME = mi-app-productos-backup-2024
NODE_ENV = production
```

### 8.5 Desplegar
1. Click en "Create Web Service"
2. Espera a que se complete el despliegue (5-10 minutos)
3. Una vez completado, verás la URL: `https://product-manager-s3.onrender.com`

## ✅ PASO 9: Probar la aplicación en producción

1. Abre la URL que te dio Render
2. Prueba crear, editar y eliminar productos
3. Prueba las funciones de backup y restauración

## 🎉 ¡LISTO!

Tu aplicación está funcionando tanto en local como en producción en Render.

## 📝 NOTAS IMPORTANTES

### ⚠️ Seguridad
- ❌ NUNCA subas el archivo `.env` a GitHub (ya está en .gitignore)
- ✅ Las credenciales solo deben estar en Render y tu archivo local `.env`
- ✅ Considera crear un usuario IAM con permisos limitados solo a tus buckets

### 💰 Costos
- **S3:** Gratis hasta 5GB en el primer año
- **Render:** El plan free se suspende después de 15 minutos de inactividad
- **Render:** 750 horas gratis al mes

### 🔧 Troubleshooting

**Error: "Access Denied" en S3:**
- Verifica que la política del bucket esté configurada correctamente
- Verifica que el usuario IAM tenga permisos de S3

**Error al subir imágenes:**
- Verifica que el bucket exista
- Verifica las credenciales en el archivo `.env`

**La app se suspende en Render:**
- Es normal en el plan free
- Se reactiva automáticamente al recibir una petición

## 📞 ¿Necesitas ayuda?

Si tienes problemas en algún paso, házmelo saber y te ayudo a resolverlo.

---

**Resumen de lo que TÚ debes hacer:**
1. ✅ Instalar Node.js
2. ✅ Crear cuenta AWS
3. ✅ Crear 2 buckets en S3
4. ✅ Crear usuario IAM y obtener credenciales
5. ✅ Ejecutar `npm install`
6. ✅ Configurar archivo `.env` con tus credenciales
7. ✅ Probar con `npm start`
8. ✅ Subir a GitHub
9. ✅ Desplegar en Render
10. ✅ ¡Disfrutar tu aplicación!
