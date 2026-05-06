import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Promotion from './models/Promotion.js';
import Content from './models/Content.js';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmeze');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Promotion.deleteMany({});
    await Content.deleteMany({});

    console.log('Cleared existing data');

    // Seed products
    const products = [
      {
        _id: "507f1f77bcf86cd799439011", // Use fixed IDs to match frontend expectations
        name: "Potatoes",
        category: "Vegetables",
        description: "Fresh graded potatoes",
        unit: "kg",
        quantity: 500,
        price: 30,
        status: "active"
      },
      {
        _id: "507f1f77bcf86cd799439012",
        name: "Onions",
        category: "Vegetables",
        description: "Sorted onions for retail orders",
        unit: "kg",
        quantity: 350,
        price: 40,
        status: "active"
      }
    ];

    await Product.insertMany(products);
    console.log('Seeded products');

    // Seed promotions
    const promotions = [
      {
        _id: "507f1f77bcf86cd799439013",
        title: "Fresh harvest deal",
        code: "FRESH10",
        discountType: "percentage",
        discountValue: 10,
        isActive: true
      }
    ];

    await Promotion.insertMany(promotions);
    console.log('Seeded promotions');

    // Seed content
    const content = [
      {
        _id: "507f1f77bcf86cd799439014",
        type: "banner",
        title: "Farm fresh produce delivered daily",
        subtitle: "Live stock from verified farmers",
        placement: "home",
        isActive: true
      },
      {
        _id: "507f1f77bcf86cd799439015",
        type: "story",
        title: "Today's farmer spotlight",
        subtitle: "Meet suppliers behind the freshest batches",
        placement: "home",
        isActive: true
      }
    ];

    await Content.insertMany(content);
    console.log('Seeded content');

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();