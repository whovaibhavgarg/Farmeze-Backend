# MongoDB Setup Guide for Farmeze Backend

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows Installation
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

### macOS Installation (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux Installation (Ubuntu/Debian)
```bash
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud Database)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string from the "Connect" button
5. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/farmeze?retryWrites=true&w=majority
   ```

## Option 3: Use Docker (Quick Setup)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name farmeze-mongo mongo:latest

# Or with persistent data
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name farmeze-mongo mongo:latest
```

## Verifying MongoDB Installation

After installation, verify MongoDB is running:

```bash
# Connect to MongoDB shell
mongosh

# Or check service status (Windows)
net start | findstr MongoDB

# Or check service status (Linux/macOS)
sudo systemctl status mongod
```

## Next Steps

Once MongoDB is running:

1. Seed the database:
   ```bash
   cd farmeze/backend
   npm run seed
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```

3. Start the frontend:
   ```bash
   cd ..
   npm run dev
   ```

The application should now work with full backend persistence!