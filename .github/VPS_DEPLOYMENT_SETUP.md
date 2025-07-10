# VPS Deployment Setup Guide

This guide explains how to configure GitHub Actions to deploy your BOWA website to a Linux VPS.

## 🔐 Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### Go to: Repository Settings → Secrets and variables → Actions → New repository secret

1. **`VPS_HOST`** - Your VPS IP address or domain name
   ```
   Example: 123.456.789.123 or yourdomain.com
   ```

2. **`VPS_USERNAME`** - Your VPS username (usually root or a sudo user)
   ```
   Example: root or ubuntu or youruser
   ```

3. **`VPS_SSH_KEY`** - Your private SSH key for VPS access
   ```
   This is the content of your private key file (usually ~/.ssh/id_rsa)
   Include the entire key including:
   -----BEGIN OPENSSH PRIVATE KEY-----
   [key content]
   -----END OPENSSH PRIVATE KEY-----
   ```

4. **`VPS_PORT`** (Optional) - SSH port if different from 22
   ```
   Example: 2222
   Default: 22 (if not specified)
   ```

5. **`SITE_URL`** (Optional) - Your website's full URL for proper asset paths
   ```
   Example: https://yourdomain.com
   Default: https://yourdomain.com (if not specified)
   ```

## 🔑 SSH Key Setup

### 1. Generate SSH Key Pair (if you don't have one)
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@bowa-deployment"
```

### 2. Copy Public Key to VPS
```bash
ssh-copy-id username@your-vps-ip
```

### 3. Test SSH Connection
```bash
ssh username@your-vps-ip
```

## 🖥️ VPS Configuration

### 1. Install Web Server (Choose one)

#### Option A: Nginx
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Option B: Apache
```bash
sudo apt update
sudo apt install apache2 -y
sudo systemctl start apache2
sudo systemctl enable apache2
```

### 2. Create Web Directory
```bash
sudo mkdir -p /var/www/bowa
sudo chown -R www-data:www-data /var/www/bowa
```

### 3. Configure Web Server

#### For Nginx - Create `/etc/nginx/sites-available/bowa`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/bowa;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bowa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### For Apache - Create `/etc/apache2/sites-available/bowa.conf`:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/bowa
    
    <Directory /var/www/bowa>
        AllowOverride All
        Require all granted
        
        # SPA fallback
        FallbackResource /index.html
    </Directory>
    
    # Cache static assets
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/bowa_error.log
    CustomLog ${APACHE_LOG_DIR}/bowa_access.log combined
</VirtualHost>
```

```bash
sudo a2ensite bowa.conf
sudo a2enmod rewrite expires headers
sudo systemctl reload apache2
```

## ⚙️ Build Configuration

Your project now has **two build configurations**:

### 1. GitHub Pages Build (`astro.config.mjs`)
- Uses `base: '/bowa'` for GitHub Pages subdirectory
- Deployed automatically via the existing `pages.yml` workflow
- Accessible at: `https://yourusername.github.io/bowa`

### 2. VPS Build (`astro.config.vps.mjs`)  
- No base path - serves from root domain
- Used by the VPS deployment workflow
- Accessible at: `https://yourdomain.com`

### Local Testing Commands:
```bash
# Test GitHub Pages build locally
npm run build:github && npm run preview

# Test VPS build locally  
npm run build:vps && npm run preview:vps
```

## 🚀 Deployment Process

The VPS workflow triggers on:
- Push to `main` or `master` branch
- Manual trigger via GitHub Actions interface

### Deployment Steps:
1. **Build** - Compiles your Astro site using VPS config
2. **Backup** - Creates timestamped backup of current deployment
3. **Deploy** - Copies new files to VPS
4. **Configure** - Sets proper permissions and reloads web server
5. **Health Check** - Verifies deployment success

## 🔧 Customization Options

### Change Deployment Directory
Edit the workflow file and replace `/var/www/bowa` with your preferred path.

### Add SSL Certificate (Recommended)
```bash
sudo apt install certbot python3-certbot-nginx  # For Nginx
# or
sudo apt install certbot python3-certbot-apache  # For Apache

sudo certbot --nginx -d yourdomain.com  # For Nginx
# or  
sudo certbot --apache -d yourdomain.com  # For Apache
```

### Environment-Specific Builds
Add environment variables to the build step:
```yaml
env:
  NODE_ENV: production
  BASE_URL: https://yourdomain.com
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Permission Denied**: Ensure your user has sudo rights
2. **SSH Key Issues**: Check key format and file permissions
3. **Build Failures**: Verify Node.js version and dependencies
4. **Web Server Not Starting**: Check configuration syntax

### Debug Commands:
```bash
# Check web server status
sudo systemctl status nginx
# or
sudo systemctl status apache2

# Check deployment directory
ls -la /var/www/bowa

# Check web server logs
sudo tail -f /var/log/nginx/error.log
# or
sudo tail -f /var/log/apache2/error.log
```

## 📊 Monitoring

The workflow includes:
- ✅ Build verification
- 📁 Automatic backups
- 🔍 Health checks
- 🧹 Automatic cleanup of old backups

Your BOWA website will be automatically deployed whenever you push changes to the main branch! 