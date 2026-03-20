const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const products = [
  // WOMEN - 8 Products
  {
    name: "Classic Beige Trench Coat",
    description: "A timeless wardrobe staple. This double-breasted trench coat is crafted from premium cotton-gabardine, featuring a belted waist and shoulder epaulettes.",
    price: 195,
    originalPrice: 249,
    category: "women",
    subcategory: "Outerwear",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2000&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2000&auto=format&fit=crop"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Black"],
    stock: 25,
    isNew: true,
    isBestSeller: true,
    rating: 4.8,
    reviews: 124
  },
  {
    name: "Silk Wrap Midi Dress",
    description: "Elegant silk midi dress with a flattering wrap silhouette. Perfect for evening events or professional settings.",
    price: 145,
    category: "women",
    subcategory: "Dresses",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e62f85452?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L"],
    colors: ["Navy", "Emerald", "Black"],
    stock: 15,
    rating: 4.9,
    reviews: 86
  },
  {
    name: "Cashmere Turtleneck Sweater",
    description: "Ultra-soft 100% cashmere turtleneck sweater. A luxurious layer for cooler months.",
    price: 160,
    category: "women",
    subcategory: "Knitwear",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Grey", "Cream", "Camel"],
    stock: 40,
    isBestSeller: true,
    rating: 4.7,
    reviews: 210
  },
  {
    name: "High-Rise Tailored Trousers",
    description: "Sophisticated high-rise trousers with a wide-leg cut and precise tailoring.",
    price: 95,
    category: "women",
    subcategory: "Trousers",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Charcoal"],
    stock: 30,
    rating: 4.5,
    reviews: 45
  },
  {
    name: "Floral Chiffon Blouse",
    description: "Lightweight chiffon blouse featuring a delicate floral print and pleated details.",
    price: 65,
    category: "women",
    subcategory: "Tops",
    image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=2000&auto=format&fit=crop",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Floral", "White"],
    stock: 55,
    isNew: true,
    rating: 4.6,
    reviews: 72
  },
  {
    name: "Linen Button-Up Shirt",
    description: "Breathable linen shirt in a relaxed fit. An essential piece for summer styling.",
    price: 55,
    category: "women",
    subcategory: "Tops",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Blue", "Pink"],
    stock: 45,
    rating: 4.4,
    reviews: 98
  },
  {
    name: "Leather Chelsea Boots",
    description: "Premium leather Chelsea boots with an elastic side panel and durable sole.",
    price: 135,
    category: "women",
    subcategory: "Footwear",
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop",
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["Black", "Brown"],
    stock: 20,
    isBestSeller: true,
    rating: 4.9,
    reviews: 135
  },
  {
    name: "Denim Trucker Jacket",
    description: "Classic denim jacket in a mid-blue wash. Distressed details for a lived-in feel.",
    price: 85,
    category: "women",
    subcategory: "Outerwear",
    image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L"],
    colors: ["Indigo"],
    stock: 35,
    rating: 4.7,
    reviews: 54
  },

  // MEN - 8 Products
  {
    name: "Slim-Fit Wool Suit",
    description: "Sharp slim-fit suit crafted from Italian wool. Includes jacket and trousers.",
    price: 450,
    originalPrice: 595,
    category: "men",
    subcategory: "Suits",
    image: "https://images.unsplash.com/photo-1594932224491-9941966bba7a?q=80&w=2000&auto=format&fit=crop",
    sizes: ["48", "50", "52", "54"],
    colors: ["Charcoal", "Navy"],
    stock: 10,
    isBestSeller: true,
    rating: 5.0,
    reviews: 28
  },
  {
    name: "Oxford Cotton Shirt",
    description: "The classic Oxford shirt. Durable cotton fabric with a button-down collar.",
    price: 65,
    category: "men",
    subcategory: "Shirts",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue", "Navy"],
    stock: 80,
    rating: 4.6,
    reviews: 340
  },
  {
    name: "Leather Bomber Jacket",
    description: "Minimalist bomber jacket made from buttery-soft sheepskin leather.",
    price: 295,
    category: "men",
    subcategory: "Outerwear",
    image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=2000&auto=format&fit=crop",
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Chocolate"],
    stock: 12,
    isNew: true,
    rating: 4.9,
    reviews: 15
  },
  {
    name: "Selvedge Denim Jeans",
    description: "Premium 13oz selvedge denim in a raw indigo wash. Slim-straight fit.",
    price: 125,
    category: "men",
    subcategory: "Jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2000&auto=format&fit=crop",
    sizes: ["30", "32", "34", "36"],
    colors: ["Raw Indigo"],
    stock: 25,
    rating: 4.8,
    reviews: 89
  },
  {
    name: "Piqué Polo Shirt",
    description: "Breathable piqué cotton polo with a subtle embroidered logo.",
    price: 45,
    category: "men",
    subcategory: "Tops",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "White", "Grey", "Green"],
    stock: 100,
    rating: 4.5,
    reviews: 156
  },
  {
    name: "Merino Wool V-Neck",
    description: "Fine-gauge merino wool sweater. Lightweight yet warm, perfect for layering.",
    price: 85,
    category: "men",
    subcategory: "Knitwear",
    image: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=2000&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Burgundy", "Forest"],
    stock: 45,
    rating: 4.7,
    reviews: 63
  },
  {
    name: "Canvas Weekender Bag",
    description: "Durable cotton canvas bag with leather trim. Ideal for short trips.",
    price: 110,
    category: "men",
    subcategory: "Accessories",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2000&auto=format&fit=crop",
    colors: ["Olive", "Tan"],
    stock: 15,
    rating: 4.8,
    reviews: 42
  },
  {
    name: "White Leather Sneakers",
    description: "Handcrafted white leather sneakers with a clean, minimal design.",
    price: 155,
    category: "men",
    subcategory: "Footwear",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=2000&auto=format&fit=crop",
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["White"],
    stock: 30,
    isBestSeller: true,
    rating: 4.9,
    reviews: 184
  },

  // KIDS - 4 Products
  {
    name: "Hooded Rain Mac",
    description: "Waterproof rain jacket with a soft cotton lining and playful prints.",
    price: 45,
    category: "kids",
    subcategory: "Outerwear",
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=2000&auto=format&fit=crop",
    sizes: ["2Y", "4Y", "6Y", "8Y"],
    colors: ["Yellow", "Red"],
    stock: 40,
    isNew: true,
    rating: 4.6,
    reviews: 31
  },
  {
    name: "Cotton Dungarees",
    description: "Comfortable and durable 100% cotton dungarees for everyday play.",
    price: 35,
    category: "kids",
    subcategory: "Outfits",
    image: "https://images.unsplash.com/photo-1519233924370-98394460592b?q=80&w=2000&auto=format&fit=crop",
    sizes: ["1Y", "2Y", "3Y"],
    colors: ["Denim", "Mustard"],
    stock: 25,
    rating: 4.7,
    reviews: 19
  },
  {
    name: "Graphic Print T-Shirt",
    description: "Fun and colorful graphic T-shirt made from organic cotton.",
    price: 18,
    category: "kids",
    subcategory: "Tops",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=2000&auto=format&fit=crop",
    sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"],
    colors: ["White", "Blue"],
    stock: 120,
    rating: 4.5,
    reviews: 44
  },
  {
    name: "Suede Baby Moccasins",
    description: "Soft suede moccasins with a flexible sole for growing feet.",
    price: 28,
    category: "kids",
    subcategory: "Footwear",
    image: "https://images.unsplash.com/photo-1572413152674-633b47bd6362?q=80&w=2000&auto=format&fit=crop",
    sizes: ["0-6M", "6-12M", "12-18M"],
    colors: ["Beige", "Grey"],
    stock: 15,
    rating: 4.9,
    reviews: 56
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  try {
    console.log("--- 🚀 Seeding Database ---");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Optional: Clear existing products
    console.log("🧹 Clearing existing products...");
    await mongoose.connection.db.collection("products").deleteMany({});
    console.log("✅ Products cleared");

    console.log(`📦 Inserting ${products.length} products...`);
    // Using raw connection to avoid model registration issues in script
    const result = await mongoose.connection.db.collection("products").insertMany(
      products.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    console.log(`✅ Successfully seeded ${result.insertedCount} products!`);
    console.log("--- ✨ Seeding Complete ---");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding Failed:");
    console.error(error.message);
    process.exit(1);
  }
}

seed();
