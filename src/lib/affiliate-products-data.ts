
export interface AffiliateLink {
  vendorName: string; // e.g., "Amazon", "Company X Store"
  url: string; // The actual affiliate link
  priceDisplay: string; // e.g., "$99.99", "Check Price", "Free Trial"
  icon?: string; // Optional: if we want to store a specific icon name later
}

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  category: string; // Added category
  imageUrl: string;
  imageHint: string; // For AI image search if needed
  links: AffiliateLink[];
  tags?: string[]; // Optional tags for finer-grained filtering in future
}

// Raw data structure, can be simpler if needed before processing
interface AffiliateProductRaw extends Omit<AffiliateProduct, 'id'> {
  _id?: any; // Placeholder for potential DB ID
}

let mockProductsRaw: AffiliateProductRaw[] = [
  {
    name: "Super Product Alpha",
    description: "The latest and greatest for boosting your productivity. Highly recommended for content creators who need to manage multiple projects.",
    category: "Software",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "modern software interface",
    links: [
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
    links: [
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
    links: [
      { vendorName: "LearnPlatform", url: "#course-link1", priceDisplay: "$199 Lifetime Access" },
    ],
    tags: ["Learning", "Skills", "Video Editing"],
  },
  {
    name: "Productivity Suite Basic",
    description: "A free suite of tools to help you get started with organizing your content creation tasks.",
    category: "Software",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "minimal software dashboard",
    links: [
      { vendorName: "FreeToolz.com", url: "#freetool-link1", priceDisplay: "Free Download" },
    ],
    tags: ["Productivity", "Free", "Utility"],
  },
  {
    name: "Creator Microphone X1",
    description: "Crystal clear audio for your podcasts and voiceovers. A great entry-level professional microphone.",
    category: "Hardware",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "studio microphone",
    links: [
      { vendorName: "AudioGear Direct", url: "#mic-link1", priceDisplay: "$99.00" },
      { vendorName: "Amazon", url: "#mic-link2", priceDisplay: "$97.50" },
    ],
    tags: ["Audio", "Podcast", "Voiceover"],
  }
];

// Process raw products to ensure they have string IDs
// Changed from const to let to allow reassignment in deleteAffiliateProduct
let mockProducts: AffiliateProduct[] = mockProductsRaw.map((product, index) => ({
  id: product._id?.toString() || `mock-affiliate-${index + 1}`,
  ...product,
}));


export function getAllAffiliateProducts(category?: string): AffiliateProduct[] {
  if (category && category.toLowerCase() !== 'all') {
    return mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  return mockProducts;
}

export function getAffiliateProductById(id: string): AffiliateProduct | undefined {
  return mockProducts.find(product => product.id === id);
}

// In a real app, these would interact with a database
export function addAffiliateProduct(productData: Omit<AffiliateProduct, 'id'>): AffiliateProduct {
  const newProduct: AffiliateProduct = {
    id: `mock-affiliate-${mockProducts.length + 1}-${Date.now()}`,
    ...productData,
  };
  mockProducts.push(newProduct);
  return newProduct;
}

export function updateAffiliateProduct(id: string, updates: Partial<Omit<AffiliateProduct, 'id'>>): AffiliateProduct | undefined {
  const productIndex = mockProducts.findIndex(p => p.id === id);
  if (productIndex === -1) return undefined;
  mockProducts[productIndex] = { ...mockProducts[productIndex], ...updates };
  return mockProducts[productIndex];
}

export function deleteAffiliateProduct(id: string): boolean {
  const initialLength = mockProducts.length;
  mockProducts = mockProducts.filter(p => p.id !== id);
  return mockProducts.length < initialLength;
}
