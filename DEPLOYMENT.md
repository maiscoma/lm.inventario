# Guía de Despliegue - LM Labor Soft Sistema de Inventario

## 📋 Requisitos Previos

### Servidor
- Ubuntu 20.04+ o CentOS 8+
- Node.js 16+ y npm
- MySQL 8.0+
- Nginx (recomendado)
- SSL Certificate (Let's Encrypt)

### Servicios Externos
- Base de datos MySQL en Clever Cloud (ya configurada)
- Firebase proyecto (configurado)

## 🚀 Despliegue en Producción

### 1. Preparar el Servidor

\`\`\`bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y
\`\`\`

### 2. Clonar y Configurar el Proyecto

\`\`\`bash
# Clonar repositorio
git clone <repository-url> /var/www/lm-inventario
cd /var/www/lm-inventario

# Configurar permisos
sudo chown -R $USER:$USER /var/www/lm-inventario
\`\`\`

### 3. Configurar Backend

\`\`\`bash
cd backend

# Instalar dependencias
npm ci --production

# Configurar variables de entorno
cp .env.example .env
nano .env
\`\`\`

**Variables de entorno de producción:**
\`\`\`env
NODE_ENV=production
PORT=3001
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# Base de datos MySQL (Clever Cloud)
DB_HOST=bs6cev8zsmvnrp1nxcm2-mysql.services.clever-cloud.com
DB_USER=uhaosltk9bxcrhfz
DB_PASSWORD=CHi0hkOp890UJ7WveG3s
DB_NAME=bs6cev8zsmvnrp1nxcm2
DB_PORT=3306
\`\`\`

\`\`\`bash
# Inicializar base de datos
npm run init-db

# Configurar PM2
pm2 start server.js --name "lm-inventario-backend"
pm2 save
pm2 startup
\`\`\`

### 4. Configurar Frontend

\`\`\`bash
cd ../frontend

# Instalar dependencias
npm ci

# Configurar variables de entorno
cp .env.example .env
nano .env
\`\`\`

**Variables de entorno de producción:**
\`\`\`env
VITE_API_URL=https://tu-dominio.com/api
VITE_APP_NAME=LM Labor Soft - Sistema de Inventario
VITE_APP_VERSION=1.0.0
\`\`\`

\`\`\`bash
# Construir para producción
npm run build

# Copiar archivos al directorio web
sudo cp -r dist/* /var/www/html/
\`\`\`

### 5. Configurar Nginx

\`\`\`bash
sudo nano /etc/nginx/sites-available/lm-inventario
\`\`\`

**Configuración de Nginx:**
\`\`\`nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Directorio raíz
    root /var/www/html;
    index index.html;
    
    # Configuración para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy para API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/lm-inventario.access.log;
    error_log /var/log/nginx/lm-inventario.error.log;
}
\`\`\`

\`\`\`bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/lm-inventario /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### 6. Configurar SSL con Let's Encrypt

\`\`\`bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

### 7. Configurar Firewall

\`\`\`bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

## 🔧 Monitoreo y Mantenimiento

### PM2 Comandos Útiles

\`\`\`bash
# Ver estado de procesos
pm2 status

# Ver logs
pm2 logs lm-inventario-backend

# Reiniciar aplicación
pm2 restart lm-inventario-backend

# Monitoreo en tiempo real
pm2 monit
\`\`\`

### Logs del Sistema

\`\`\`bash
# Logs de Nginx
sudo tail -f /var/log/nginx/lm-inventario.access.log
sudo tail -f /var/log/nginx/lm-inventario.error.log

# Logs de la aplicación
pm2 logs lm-inventario-backend --lines 100
\`\`\`

### Backup de Base de Datos

\`\`\`bash
# Script de backup (crear en /home/user/backup-db.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h bs6cev8zsmvnrp1nxcm2-mysql.services.clever-cloud.com \
          -u uhaosltk9bxcrhfz \
          -p'CHi0hkOp890UJ7WveG3s' \
          bs6cev8zsmvnrp1nxcm2 > /backups/lm_inventario_$DATE.sql

# Mantener solo los últimos 7 backups
find /backups -name "lm_inventario_*.sql" -mtime +7 -delete
\`\`\`

\`\`\`bash
# Hacer ejecutable y programar
chmod +x /home/user/backup-db.sh
crontab -e
# Agregar: 0 2 * * * /home/user/backup-db.sh
\`\`\`

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar credenciales en .env
   - Comprobar conectividad: `telnet bs6cev8zsmvnrp1nxcm2-mysql.services.clever-cloud.com 3306`

2. **Error 502 Bad Gateway**
   - Verificar que PM2 esté ejecutando la aplicación: `pm2 status`
   - Revisar logs: `pm2 logs lm-inventario-backend`

3. **Problemas de CORS**
   - Verificar configuración de CORS en backend
   - Comprobar que la URL del frontend esté en la lista de orígenes permitidos

### Comandos de Diagnóstico

\`\`\`bash
# Verificar servicios
sudo systemctl status nginx
pm2 status

# Verificar puertos
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Verificar logs
journalctl -u nginx -f
pm2 logs lm-inventario-backend --lines 50
\`\`\`

## 📊 Métricas y Monitoreo

### Configurar Monitoreo con PM2 Plus (Opcional)

\`\`\`bash
# Registrarse en PM2 Plus y obtener clave
pm2 link <secret_key> <public_key>

# Instalar módulos de monitoreo
pm2 install pm2-server-monit
\`\`\`

### Alertas por Email (Opcional)

Configurar alertas para:
- Caída del servidor
- Alto uso de CPU/memoria
- Errores en la aplicación
- Fallos en la base de datos

---

**Nota**: Esta guía asume un entorno de producción básico. Para entornos empresariales, considerar implementar:
- Load balancer
- Múltiples instancias
- Monitoreo avanzado (Prometheus, Grafana)
- CI/CD pipeline
- Contenedores (Docker)
