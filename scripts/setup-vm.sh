#!/bin/bash
# =============================================================================
# VIGÍA — Setup inicial de gobla-dashboard-vm
# Ejecutar UNA SOLA VEZ en la VM: bash setup-vm.sh
# =============================================================================

set -e

echo "▸ Actualizando paquetes..."
sudo apt update -qq

echo "▸ Instalando nginx..."
sudo apt install -y nginx

echo "▸ Creando directorio del sitio..."
sudo mkdir -p /var/www/vigia
sudo chown -R santoles5:santoles5 /var/www/vigia

echo "▸ Configurando nginx para SPA React..."
sudo tee /etc/nginx/sites-available/vigia > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    server_name _;

    root /var/www/vigia;
    index index.html;

    # React Router: todas las rutas sirven index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Assets con caché larga (Vite genera hashes en los nombres)
    location ~* \.(js|css|png|svg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compresión gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;
}
NGINX

echo "▸ Activando site y desactivando default..."
sudo ln -sf /etc/nginx/sites-available/vigia /etc/nginx/sites-enabled/vigia
sudo rm -f /etc/nginx/sites-enabled/default

echo "▸ Verificando configuración nginx..."
sudo nginx -t

echo "▸ Habilitando nginx en arranque..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ""
echo "✅ VM lista. Nginx escuchando en puerto 80."
echo "   Visita: http://$(curl -s ifconfig.me)"
