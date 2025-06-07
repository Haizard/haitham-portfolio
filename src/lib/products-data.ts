
export interface AffiliateLink {
  vendorName: string;
  url: string;
  priceDisplay: string;
  icon?: string;
}

export type ProductType = 'affiliate' | 'creator';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imageHint: string;
  productType: ProductType;
  tags?: string[];

  // For affiliate products
  links?: AffiliateLink[]; // Optional: only for affiliate products

  // For creator's own products
  price?: number; // Optional: only for creator products
}

// Raw data structure
interface ProductRaw extends Omit<Product, 'id' | 'productType'> {
  _id?: any;
  productTypeInput: ProductType;
  priceInput?: number;
  linksInput?: AffiliateLink[];
}

let mockProductsRaw: ProductRaw[] = [
  {
    name: "Super Product Alpha",
    description: "The latest and greatest for boosting your productivity. Highly recommended for content creators who need to manage multiple projects.",
    category: "Software",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "modern software interface",
    productTypeInput: 'affiliate',
    linksInput: [
      { vendorName: "Vendor Alpha Store", url: "#alpha-link1", priceDisplay: "$49.99/month" },
      { vendorName: "App Marketplace", url: "#alpha-link2", priceDisplay: "Check Price" },
    ],
    tags: ["Productivity", "SaaS"],
  },
  {
    name: "Creator's Gadget Pro",
    description: "An essential piece of hardware for any serious creator. Improves video quality and workflow significantly.",
    category: "Hardware",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "sleek hardware gadget",
    productTypeInput: 'affiliate',
    linksInput: [
      { vendorName: "GadgetPro Direct", url: "#gadget-link1", priceDisplay: "$299.00" },
      { vendorName: "Amazon", url: "#gadget-link2", priceDisplay: "$295.99" },
      { vendorName: "Best Buy", url: "#gadget-link3", priceDisplay: "See Current Deals" },
    ],
    tags: ["Video", "Audio", "Gear"],
  },
  {
    name: "Online Course: Master Content Creation",
    description: "A comprehensive online course covering everything from idea generation to advanced editing techniques.",
    category: "Education",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "online course platform",
    productTypeInput: 'affiliate',
    linksInput: [
      { vendorName: "LearnPlatform", url: "#course-link1", priceDisplay: "$199 Lifetime Access" },
    ],
    tags: ["Learning", "Skills", "Video Editing"],
  },
  {
    name: "My Awesome Creator T-Shirt",
    description: "High-quality branded t-shirt, designed by me! Show your support.",
    category: "Merchandise",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "cool t-shirt design",
    productTypeInput: 'creator',
    priceInput: 25.99,
    tags: ["Apparel", "Creator Merch"],
  },
  {
    name: "Digital Guide: Productivity Hacks",
    description: "My exclusive e-book packed with tips to boost your creative output.",
    category: "Digital Products",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "ebook cover",
    productTypeInput: 'creator',
    priceInput: 9.99,
    tags: ["Ebook", "Productivity", "Guide"],
  }
];

let mockProducts: Product[] = mockProductsRaw.map((product, index) => ({
  id: product._id?.toString() || `mock-product-${index + 1}`,
  name: product.name,
  description: product.description,
  category: product.category,
  imageUrl: product.imageUrl,
  imageHint: product.imageHint,
  productType: product.productTypeInput,
  tags: product.tags,
  links: product.productTypeInput === 'affiliate' ? product.linksInput : undefined,
  price: product.productTypeInput === 'creator' ? product.priceInput : undefined,
}));

export function getAllProducts(category?: string): Product[] {
  if (!Array.isArray(mockProducts)) {
    console.error("[products-data] CRITICAL: mockProducts is not an array. Type:", typeof mockProducts, ". Value:", mockProducts);
    return [];
  }
  let productsToReturn = mockProducts;
  if (category && category.toLowerCase() !== 'all') {
    productsToReturn = mockProducts.filter(p => 
      p.category && typeof p.category === 'string' && p.category.toLowerCase() === category.toLowerCase()
    );
  }
  return productsToReturn;
}

export function getProductById(id: string): Product | undefined {
  if (!Array.isArray(mockProducts)) {
    console.error("[products-data] CRITICAL: mockProducts is not an array in getProductById.");
    return undefined;
  }
  return mockProducts.find(product => product.id === id);
}

export function addProduct(productData: Omit<Product, 'id'>): Product {
  if (!Array.isArray(mockProducts)) {
    console.error("[products-data] CRITICAL: mockProducts is not an array in addProduct.");
    // Potentially initialize mockProducts if it's truly missing, though this indicates a deeper issue
    mockProducts = []; 
  }
  const newProduct: Product = {
    id: `mock-product-${mockProducts.length + 1}-${Date.now()}`,
    ...productData,
  };
  mockProducts.push(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined {
  if (!Array.isArray(mockProducts)) {
    console.error("[products-data] CRITICAL: mockProducts is not an array in updateProduct.");
    return undefined;
  }
  const productIndex = mockProducts.findIndex(p => p.id === id);
  if (productIndex === -1) return undefined;
  mockProducts[productIndex] = { ...mockProducts[productIndex], ...updates };
  return mockProducts[productIndex];
}

export function deleteProduct(id: string): boolean {
  if (!Array.isArray(mockProducts)) {
    console.error("[products-data] CRITICAL: mockProducts is not an array in deleteProduct.");
    return false;
  }
  const initialLength = mockProducts.length;
  mockProducts = mockProducts.filter(p => p.id !== id);
  return mockProducts.length < initialLength;
}
