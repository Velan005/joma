import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { products } from '../data/products';
import Product from '../models/Product';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    console.log(`Seeding ${products.length} products...`);
    
    // Remove individual 'id' and let MongoDB generate '_id'
    const formattedProducts = products.map(({ id, ...rest }) => ({
      ...rest,
      // Ensure colors are properly formatted if needed, or leave as is if schema matches
    }));

    await Product.insertMany(formattedProducts);
    
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
