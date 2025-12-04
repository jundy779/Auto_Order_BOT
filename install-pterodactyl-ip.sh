#!/bin/bash

# Script Instalasi Pterodactyl Panel dengan IP langsung
# Untuk IP: 47.84.58.150
# OS: Debian 11 (Bullseye)
# RAM: 1GB (dengan optimasi)

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Pterodactyl Panel Installation Script - Debian 11        ║"
echo "║  Optimized for 1GB RAM                                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variabel konfigurasi
PANEL_DIR="/var/www/pterodactyl"
DB_NAME="panel"
DB_USER="pterodactyl"
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Auto-detect IP atau gunakan IP yang diberikan
SERVER_IP="47.84.58.150"
APP_URL="${SERVER_IP}"

ADMIN_EMAIL=""
ADMIN_USERNAME="admin"
ADMIN_PASSWORD=""

# Fungsi untuk print pesan
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cek root
if [ "$EUID" -ne 0 ]; then 
    print_error "Script ini harus dijalankan sebagai root!"
    exit 1
fi

# Input konfigurasi
echo "═══════════════════════════════════════════════════════════"
echo "Konfigurasi Panel"
echo "═══════════════════════════════════════════════════════════"
echo "IP Server: ${SERVER_IP}"
echo ""
read -p "Gunakan IP langsung atau domain? (ip/domain) [ip]: " USE_TYPE
USE_TYPE=${USE_TYPE:-ip}

if [ "$USE_TYPE" = "domain" ]; then
    read -p "Masukkan domain/URL panel (contoh: panel.example.com): " APP_URL
else
    APP_URL="${SERVER_IP}"
    print_info "Menggunakan IP langsung: ${APP_URL}"
fi

read -p "Masukkan email admin: " ADMIN_EMAIL
read -sp "Masukkan password admin (min 8 karakter): " ADMIN_PASSWORD
echo ""
echo ""

# Validasi input
if [ -z "$APP_URL" ] || [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    print_error "Semua field harus diisi!"
    exit 1
fi

if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    print_error "Password harus minimal 8 karakter!"
    exit 1
fi

print_info "Memulai instalasi untuk: ${APP_URL}"

# 1. Fix repository issues (Alibaba Cloud)
print_info "Memperbaiki repository..."
# Disable backports jika menyebabkan error
if grep -q "bullseye-backports" /etc/apt/sources.list /etc/apt/sources.list.d/* 2>/dev/null; then
    sed -i 's/^deb.*bullseye-backports/# &/' /etc/apt/sources.list /etc/apt/sources.list.d/* 2>/dev/null || true
    print_info "Repository backports dinonaktifkan"
fi

# 2. Update sistem
print_info "Mengupdate sistem..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq || {
    print_warn "Update gagal, mencoba tanpa backports..."
    apt-get update -qq -o Acquire::Check-Valid-Until=false || true
}
apt-get upgrade -y -qq

# 3. Install dependencies dasar
print_info "Menginstall dependencies..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    unzip \
    tar \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# 4. Setup Swap File (penting untuk RAM 1GB)
print_info "Membuat swap file 1GB..."
if [ ! -f /swapfile ]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    print_info "Swap file berhasil dibuat"
else
    print_warn "Swap file sudah ada, dilewati"
fi

# 5. Install PHP 8.1
print_info "Menginstall PHP 8.1..."
apt-get install -y -qq \
    php8.1 \
    php8.1-cli \
    php8.1-gd \
    php8.1-mysql \
    php8.1-pdo \
    php8.1-mbstring \
    php8.1-tokenizer \
    php8.1-bcmath \
    php8.1-xml \
    php8.1-fpm \
    php8.1-curl \
    php8.1-zip

# Optimasi PHP-FPM untuk RAM 1GB
print_info "Mengoptimasi PHP-FPM..."
sed -i 's/pm.max_children = 5/pm.max_children = 3/' /etc/php/8.1/fpm/pool.d/www.conf
sed -i 's/pm.start_servers = 2/pm.start_servers = 1/' /etc/php/8.1/fpm/pool.d/www.conf
sed -i 's/pm.min_spare_servers = 1/pm.min_spare_servers = 1/' /etc/php/8.1/fpm/pool.d/www.conf
sed -i 's/pm.max_spare_servers = 3/pm.max_spare_servers = 2/' /etc/php/8.1/fpm/pool.d/www.conf
sed -i 's/;pm.max_requests = 500/pm.max_requests = 200/' /etc/php/8.1/fpm/pool.d/www.conf

# 6. Install MariaDB
print_info "Menginstall MariaDB..."
apt-get install -y -qq mariadb-server mariadb-client

# Optimasi MariaDB untuk RAM 1GB
print_info "Mengoptimasi MariaDB..."
cat > /etc/mysql/mariadb.conf.d/50-server.cnf << EOF
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 50
query_cache_size = 16M
tmp_table_size = 32M
max_heap_table_size = 32M
EOF

# Setup database
print_info "Menyiapkan database..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1' WITH GRANT OPTION;"
mysql -e "FLUSH PRIVILEGES;"

# 7. Install Redis
print_info "Menginstall Redis..."
apt-get install -y -qq redis-server

# Optimasi Redis
sed -i 's/# maxmemory <bytes>/maxmemory 128mb/' /etc/redis/redis.conf
sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# 8. Install Nginx
print_info "Menginstall Nginx..."
apt-get install -y -qq nginx

# 9. Install Composer
print_info "Menginstall Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# 10. Install Node.js 20.x (LTS)
print_info "Menginstall Node.js 20.x (LTS)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs

# Install Yarn
print_info "Menginstall Yarn..."
npm install -g yarn

# 11. Clone Pterodactyl Panel
print_info "Mengclone Pterodactyl Panel..."
if [ -d "$PANEL_DIR" ]; then
    print_warn "Direktori panel sudah ada, menghapus..."
    rm -rf "$PANEL_DIR"
fi

mkdir -p "$PANEL_DIR"
cd "$PANEL_DIR"

git clone https://github.com/pterodactyl/panel.git .
git checkout $(curl -s https://api.github.com/repos/pterodactyl/panel/releases/latest | grep 'tag_name' | cut -d '"' -f 4)

# 12. Install dependencies PHP
print_info "Menginstall dependencies PHP..."
composer install --no-dev --optimize-autoloader --no-interaction

# 13. Setup environment
print_info "Menyiapkan file .env..."
cp .env.example .env
php artisan key:generate --force

# Update .env dengan konfigurasi
if [ "$USE_TYPE" = "ip" ]; then
    sed -i "s|APP_URL=https://panel.example.com|APP_URL=http://${APP_URL}|g" .env
else
    sed -i "s|APP_URL=https://panel.example.com|APP_URL=https://${APP_URL}|g" .env
fi

sed -i "s|APP_ENVIRONMENT_ONLY=true|APP_ENVIRONMENT_ONLY=false|g" .env
sed -i "s|DB_DATABASE=pterodactyl|DB_DATABASE=${DB_NAME}|g" .env
sed -i "s|DB_USERNAME=pterodactyl|DB_USERNAME=${DB_USER}|g" .env
sed -i "s|DB_PASSWORD=|DB_PASSWORD=${DB_PASS}|g" .env
sed -i "s|CACHE_DRIVER=file|CACHE_DRIVER=redis|g" .env
sed -i "s|SESSION_DRIVER=file|SESSION_DRIVER=redis|g" .env
sed -i "s|REDIS_HOST=127.0.0.1|REDIS_HOST=127.0.0.1|g" .env
sed -i "s|REDIS_PORT=6379|REDIS_PORT=6379|g" .env

# 14. Build assets
print_info "Membangun assets frontend..."
yarn install --production
yarn build:production

# 15. Setup database
print_info "Menjalankan migrasi database..."
php artisan migrate --force --seed

# 16. Buat user admin
print_info "Membuat user admin..."
php artisan p:user:make \
    --email="${ADMIN_EMAIL}" \
    --username="${ADMIN_USERNAME}" \
    --name-first="Admin" \
    --name-last="User" \
    --admin \
    --password="${ADMIN_PASSWORD}" || true

# 17. Setup permissions
print_info "Mengatur permissions..."
chown -R www-data:www-data "$PANEL_DIR"
chmod -R 755 "$PANEL_DIR"
chmod -R 775 storage bootstrap/cache

# 18. Setup Nginx
print_info "Mengkonfigurasi Nginx..."
cat > /etc/nginx/sites-available/pterodactyl.conf << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_URL};

    root ${PANEL_DIR}/public;

    index index.php;

    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

ln -sf /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# 19. Setup Queue Worker
print_info "Mengkonfigurasi Queue Worker..."
cat > /etc/systemd/system/pteroq.service << EOF
[Unit]
Description=Pterodactyl Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php ${PANEL_DIR}/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3 --max-time=3600
StartLimitInterval=180
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
EOF

# 20. Setup Schedule (Cron)
print_info "Mengkonfigurasi Cron..."
(crontab -u www-data -l 2>/dev/null; echo "* * * * * php ${PANEL_DIR}/artisan schedule:run >> /dev/null 2>&1") | crontab -u www-data -

# 21. Start services
print_info "Menjalankan services..."
systemctl enable --now php8.1-fpm
systemctl enable --now mariadb
systemctl enable --now redis-server
systemctl enable --now nginx
systemctl enable --now pteroq
systemctl restart php8.1-fpm
systemctl restart mariadb
systemctl restart redis-server
systemctl restart nginx
systemctl restart pteroq

# 22. Setup firewall (jika UFW terinstall)
if command -v ufw &> /dev/null; then
    print_info "Mengkonfigurasi firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || true
fi

# Selesai
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ INSTALASI SELESAI!                                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Informasi Login:"
echo "═══════════════════════════════════════════════════════════"
if [ "$USE_TYPE" = "ip" ]; then
    echo "URL Panel: http://${APP_URL}"
else
    echo "URL Panel: https://${APP_URL}"
fi
echo "Email: ${ADMIN_EMAIL}"
echo "Username: ${ADMIN_USERNAME}"
echo "Password: ${ADMIN_PASSWORD}"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Informasi Database:"
echo "═══════════════════════════════════════════════════════════"
echo "Database: ${DB_NAME}"
echo "Username: ${DB_USER}"
echo "Password: ${DB_PASS}"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Langkah Selanjutnya:"
echo "═══════════════════════════════════════════════════════════"
if [ "$USE_TYPE" = "ip" ]; then
    echo "✅ Panel sudah bisa diakses di: http://${APP_URL}"
    echo ""
    echo "⚠️  Catatan: Menggunakan IP langsung (HTTP)"
    echo "   Untuk production, disarankan setup domain + SSL"
    echo ""
    echo "Untuk setup domain + SSL nanti:"
    echo "1. Point domain ke IP: ${SERVER_IP}"
    echo "2. Install certbot: apt-get install -y certbot python3-certbot-nginx"
    echo "3. Setup SSL: certbot --nginx -d domain-kamu.com"
else
    echo "1. Setup SSL dengan menjalankan:"
    echo "   apt-get install -y certbot python3-certbot-nginx"
    echo "   certbot --nginx -d ${APP_URL}"
    echo ""
    echo "2. Pastikan domain mengarah ke IP: ${SERVER_IP}"
fi
echo ""
echo "3. Setup Wings (Daemon) di server terpisah untuk menjalankan server game"
echo ""
print_info "Script selesai!"

