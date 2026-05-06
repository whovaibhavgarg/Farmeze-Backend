# Farmeze Backend API

A Node.js/Express backend API for the Farmeze application with MongoDB database.

## Features

- RESTful API endpoints for all Farmeze entities
- MongoDB database with Mongoose ODM
- CORS support for frontend integration
- Error handling and validation
- Automatic order number generation

## Quick Start

1. **Install Dependencies:**
   ```bash
   cd farmeze/backend
   npm install
   ```

2. **Set up MongoDB:**
   - See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions
   - For quick setup, use MongoDB Atlas (cloud) or Docker

3. **Seed Database:**
   ```bash
   npm run seed
   ```

4. **Start Backend:**
   ```bash
   npm run dev
   ```

5. **Start Frontend (in another terminal):**
   ```bash
   cd ..
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmeze
NODE_ENV=development
CORS_ORIGIN=http://localhost:8083
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/farmeze?retryWrites=true&w=majority
```

## Installation

1. Navigate to the backend directory:
   ```bash
   cd farmeze/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update the values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/farmeze
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8083
   ```

4. Start MongoDB service (if using local MongoDB):
   ```bash
   # On Windows
   net start MongoDB

   # On macOS
   brew services start mongodb/brew/mongodb-community

   # On Linux
   sudo systemctl start mongod
   ```

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The API will be available at `http://localhost:5000/api`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id` - Update an order
- `GET /api/orders/:id/items` - Get order items

### Promotions
- `GET /api/promotions` - Get all promotions
- `POST /api/promotions` - Create a new promotion
- `PATCH /api/promotions/:id` - Update a promotion
- `DELETE /api/promotions/:id` - Delete a promotion

### Content
- `GET /api/content` - Get all content
- `POST /api/content` - Create new content
- `PATCH /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Farmers
- `GET /api/farmers` - Get all farmers
- `POST /api/farmers` - Create a new farmer

### Inventory Entries
- `GET /api/inventory-entries` - Get all inventory entries
- `POST /api/inventory-entries` - Create a new inventory entry

### Price Adjustments
- `GET /api/price-adjustments` - Get all price adjustments
- `POST /api/price-adjustments` - Create a new price adjustment

### Health Check
- `GET /api/health` - Check API status

## Data Models

All models include automatic timestamps (`createdAt`, `updatedAt`).

### Product
```javascript
{
  name: String (required),
  category: String (required),
  description: String,
  unit: String (default: 'kg'),
  quantity: Number (required, min: 0),
  price: Number (required, min: 0),
  farmerId: ObjectId (ref: 'Farmer'),
  status: String (enum: ['active', 'draft', 'out_of_stock']),
  imageUrl: String
}
```

### Order
```javascript
{
  orderNumber: String (auto-generated, unique),
  customerName: String (required),
  customerPhone: String,
  deliveryAddress: String,
  city: String,
  status: String (enum: ['new', 'approved', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: String (enum: ['paid', 'unpaid', 'refunded']),
  paymentMedium: String (enum: ['cod', 'upi', 'card', 'wallet', 'bank_transfer']),
  subtotal: Number (required),
  discountAmount: Number (default: 0),
  totalAmount: Number (required),
  notes: String,
  items: [OrderItem]
}
```

## Connecting to Frontend

The frontend is already configured to use this backend. Make sure the `VITE_API_BASE_URL` environment variable in the frontend points to `http://localhost:5000/api`.

## Troubleshooting

1. **MongoDB Connection Issues**:
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in `.env`
   - For MongoDB Atlas, use the connection string provided

2. **CORS Issues**:
   - Update `CORS_ORIGIN` in `.env` to match your frontend URL

3. **Port Conflicts**:
   - Change the `PORT` in `.env` if 5000 is already in use

## Development

- The server auto-restarts on file changes in development mode
- All routes include proper error handling
- Request validation is handled by Mongoose schemas