# node-startup

# Clone Repo
git clone git@github.com/pssalman/node-startup.git

# Install Node if not installed
wget -qO- https://deb.nodesource.com/setup_10.x | sudo -E bash -  
sudo apt install -y nodejs

# Check Version
node -v  
npm -v

# Install Dependencies
cd node-startup  
npm install

# Generate SSL Key and Certificate to Run HTTPS
mkdir ssl  
cd ssl  
openssl req -newkey rsa:2048 -nodes -keyout localhost-privkey.pem -x509 -days 365 -out localhost-cert.pem  
openssl dhparam -out dh-strong.pem 20484

# Update Environmental Variables File
cp .env-sample .env  
Change values according to your setup

# Run with nodemon
npm run dev

# Run with Node
npm start

