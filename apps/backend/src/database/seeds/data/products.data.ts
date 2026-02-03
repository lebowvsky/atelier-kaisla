/**
 * Sample product data for seeding
 * Organized by category for easy maintenance
 */

export interface ProductSeedData {
  name: string;
  description: string;
  category: 'wall-hanging' | 'rug';
  price: number;
  status: 'available' | 'sold' | 'draft';
  stockQuantity: number;
  images: string[];
  dimensions: {
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  materials: string;
}

/**
 * Wall Hanging Products
 */
export const wallHangingProducts: ProductSeedData[] = [
  {
    name: 'Sunset Dreams Macramé',
    description:
      'Handcrafted macramé wall hanging featuring warm sunset tones. Made with 100% natural cotton rope in shades of terracotta, gold, and cream.',
    category: 'wall-hanging',
    price: 149.99,
    status: 'available',
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&crop=detail',
    ],
    dimensions: {
      width: 60,
      height: 90,
      unit: 'cm',
    },
    materials: 'Cotton rope, wooden dowel, natural dyes',
  },
  {
    name: 'Boho Fringe Wall Art',
    description:
      'Minimalist bohemian wall hanging with delicate fringe details. Perfect for modern interiors seeking a touch of warmth.',
    category: 'wall-hanging',
    price: 89.99,
    status: 'available',
    stockQuantity: 2,
    images: [
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800',
    ],
    dimensions: {
      width: 45,
      height: 70,
      unit: 'cm',
    },
    materials: 'Organic cotton, bamboo stick',
  },
  {
    name: 'Nordic Geometric Tapestry',
    description:
      'Woven wall tapestry inspired by Nordic design patterns. Features clean geometric shapes in muted earth tones.',
    category: 'wall-hanging',
    price: 199.99,
    status: 'available',
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&crop=detail',
    ],
    dimensions: {
      width: 80,
      height: 100,
      unit: 'cm',
    },
    materials: 'Wool, linen, cotton blend',
  },
  {
    name: 'Coastal Breeze Weaving',
    description:
      'Light and airy woven wall art reminiscent of ocean waves. Natural white and blue tones create a calming coastal vibe.',
    category: 'wall-hanging',
    price: 129.99,
    status: 'sold',
    stockQuantity: 0,
    images: [
      'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=800',
    ],
    dimensions: {
      width: 50,
      height: 65,
      unit: 'cm',
    },
    materials: 'Cotton, jute, indigo dye',
  },
  {
    name: 'Terra Cotta Dream Catcher',
    description:
      'Modern interpretation of traditional dream catcher design with earthy terracotta and cream tones.',
    category: 'wall-hanging',
    price: 79.99,
    status: 'available',
    stockQuantity: 3,
    images: [
      'https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=800',
    ],
    dimensions: {
      width: 35,
      height: 55,
      unit: 'cm',
    },
    materials: 'Cotton cord, metal ring, feathers',
  },
  {
    name: 'Abstract Fiber Art',
    description:
      'Contemporary fiber art piece with abstract shapes and textures. A statement piece for modern art lovers.',
    category: 'wall-hanging',
    price: 249.99,
    status: 'draft',
    stockQuantity: 0,
    images: [
      'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800',
    ],
    dimensions: {
      width: 70,
      height: 95,
      unit: 'cm',
    },
    materials: 'Mixed fibers, wool roving, silk',
  },
  {
    name: 'Rainbow Macramé Small',
    description:
      'Cheerful small macramé with rainbow gradient. Perfect for nurseries or adding a pop of color to any room.',
    category: 'wall-hanging',
    price: 59.99,
    status: 'available',
    stockQuantity: 5,
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800',
    ],
    dimensions: {
      width: 30,
      height: 45,
      unit: 'cm',
    },
    materials: 'Cotton rope, natural dyes',
  },
  {
    name: 'Minimalist Line Wall Art',
    description:
      'Ultra-minimal wall hanging featuring simple lines and neutral tones. Scandinavian-inspired design.',
    category: 'wall-hanging',
    price: 99.99,
    status: 'available',
    stockQuantity: 2,
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800',
    ],
    dimensions: {
      width: 40,
      height: 60,
      unit: 'cm',
    },
    materials: 'Linen, wooden dowel',
  },
];

/**
 * Rug Products
 */
export const rugProducts: ProductSeedData[] = [
  {
    name: 'Moroccan Berber Rug',
    description:
      'Authentic handwoven Berber rug with traditional diamond patterns. Made by skilled artisans using centuries-old techniques.',
    category: 'rug',
    price: 459.99,
    status: 'available',
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&crop=detail',
    ],
    dimensions: {
      width: 160,
      height: 230,
      unit: 'cm',
    },
    materials: 'Pure wool, natural dyes',
  },
  {
    name: 'Scandinavian Minimal Runner',
    description:
      'Sleek runner rug with subtle geometric pattern. Perfect for hallways or as a kitchen runner.',
    category: 'rug',
    price: 189.99,
    status: 'available',
    stockQuantity: 2,
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
    ],
    dimensions: {
      width: 70,
      height: 200,
      unit: 'cm',
    },
    materials: 'Cotton, jute blend',
  },
  {
    name: 'Bohemian Kilim Rug',
    description:
      'Vibrant kilim rug with traditional Turkish patterns. Flat-woven for easy maintenance and versatile placement.',
    category: 'rug',
    price: 329.99,
    status: 'available',
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&crop=detail',
    ],
    dimensions: {
      width: 140,
      height: 200,
      unit: 'cm',
    },
    materials: 'Wool, cotton warp',
  },
  {
    name: 'Natural Jute Round Rug',
    description:
      'Eco-friendly circular rug made from sustainable jute fibers. Adds organic texture to any space.',
    category: 'rug',
    price: 149.99,
    status: 'available',
    stockQuantity: 4,
    images: ['https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800'],
    dimensions: {
      width: 150,
      height: 150,
      unit: 'cm',
    },
    materials: '100% natural jute',
  },
  {
    name: 'Vintage Persian-Inspired Rug',
    description:
      'Luxurious rug inspired by classic Persian designs. Hand-knotted with intricate floral motifs.',
    category: 'rug',
    price: 699.99,
    status: 'sold',
    stockQuantity: 0,
    images: [
      'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800',
      'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800&crop=detail',
    ],
    dimensions: {
      width: 200,
      height: 300,
      unit: 'cm',
    },
    materials: 'Wool, silk accents',
  },
  {
    name: 'Modern Abstract Area Rug',
    description:
      'Contemporary area rug with bold abstract design in navy and cream. Makes a statement in living rooms.',
    category: 'rug',
    price: 389.99,
    status: 'available',
    stockQuantity: 2,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    ],
    dimensions: {
      width: 170,
      height: 240,
      unit: 'cm',
    },
    materials: 'Wool, cotton blend',
  },
  {
    name: 'Cozy Shag Rug',
    description:
      'Plush high-pile shag rug in warm cream color. Ultra-soft underfoot, perfect for bedrooms.',
    category: 'rug',
    price: 229.99,
    status: 'available',
    stockQuantity: 3,
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    ],
    dimensions: {
      width: 160,
      height: 230,
      unit: 'cm',
    },
    materials: 'Polyester, high-pile weave',
  },
  {
    name: 'Striped Cotton Dhurrie',
    description:
      'Lightweight dhurrie rug with classic stripe pattern. Reversible and easy to clean.',
    category: 'rug',
    price: 119.99,
    status: 'draft',
    stockQuantity: 0,
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
    ],
    dimensions: {
      width: 120,
      height: 180,
      unit: 'cm',
    },
    materials: '100% cotton',
  },
  {
    name: 'Ethnic Tribal Runner',
    description:
      'Narrow runner featuring ethnic tribal patterns. Adds character to hallways and entryways.',
    category: 'rug',
    price: 169.99,
    status: 'available',
    stockQuantity: 2,
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    ],
    dimensions: {
      width: 60,
      height: 180,
      unit: 'cm',
    },
    materials: 'Wool, cotton',
  },
  {
    name: 'Pastel Tufted Rug',
    description:
      'Soft tufted rug in pastel pink and cream. Hand-tufted with plush texture, ideal for modern nurseries.',
    category: 'rug',
    price: 279.99,
    status: 'available',
    stockQuantity: 1,
    images: [
      'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800',
    ],
    dimensions: {
      width: 140,
      height: 200,
      unit: 'cm',
    },
    materials: 'Wool, hand-tufted',
  },
];

/**
 * Get all products
 */
export const getAllProducts = (): ProductSeedData[] => {
  return [...wallHangingProducts, ...rugProducts];
};

/**
 * Get products by category
 */
export const getProductsByCategory = (
  category: 'wall-hanging' | 'rug',
): ProductSeedData[] => {
  return category === 'wall-hanging' ? wallHangingProducts : rugProducts;
};
