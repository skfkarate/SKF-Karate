/**
 * Seed: Products — SKF Shop merchandise.
 */

export interface ProductVariant {
  id: string
  size: string
  stock: number
  requiresApproval?: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  category: 'uniforms' | 'belts' | 'gear' | 'merchandise'
  price: number
  images: string[]
  variants: ProductVariant[]
  rating: number
  reviewCount: number
  createdAt: string
  requiresTier?: 'white' | 'bronze' | 'silver' | 'gold' | 'black'
}

export const products: Product[] = [
  {
    id: 'prd_001', name: 'KUROOBI // TOURNAMENT GI',
    description: 'Official SKF competition-grade white karate gi. Lightweight, durable, and highly breathable. Approved for all domestic and international WKF tournaments.',
    category: 'uniforms', price: 2999,
    images: ['https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_001_xs', size: 'XS (130cm)', stock: 5 },
      { id: 'prd_001_s',  size: 'S (140cm)',  stock: 8 },
      { id: 'prd_001_m',  size: 'M (150cm)',  stock: 10 },
      { id: 'prd_001_l',  size: 'L (160cm)',  stock: 7 },
      { id: 'prd_001_xl', size: 'XL (170cm)', stock: 4 },
    ],
    rating: 4.8, reviewCount: 42, createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prd_002', name: 'TACTICAL GRADING BELT',
    description: 'High-quality cotton blend standard grading belts. Holds color firmly even after multiple washes.',
    category: 'belts', price: 450,
    images: ['https://images.unsplash.com/photo-1582230009696-6b21ba3b3bed?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_002_white', size: 'White', stock: 20 },
      { id: 'prd_002_yellow', size: 'Yellow', stock: 15 },
      { id: 'prd_002_orange', size: 'Orange', stock: 15 },
      { id: 'prd_002_green', size: 'Green', stock: 10 },
      { id: 'prd_002_blue', size: 'Blue', stock: 10 },
      { id: 'prd_002_brown', size: 'Brown', stock: 5 },
      { id: 'prd_002_black', size: 'Black', stock: 3, requiresApproval: true },
    ],
    rating: 4.6, reviewCount: 78, createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'prd_003', name: 'CORE // HEAVYWEIGHT TEE',
    description: 'Show your team spirit! Premium thick cotton t-shirt with classic brutalist SKF logo. Boxy fit.',
    category: 'merchandise', price: 999,
    images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_003_s', size: 'S', stock: 0 },
      { id: 'prd_003_m', size: 'M', stock: 12 },
      { id: 'prd_003_l', size: 'L', stock: 8 },
    ],
    rating: 4.5, reviewCount: 31, createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'prd_004', name: 'ARMOR // SHIN GUARDS',
    description: 'Elite protective gear designed for full-contact impact distribution. Removable foot protectors.',
    category: 'gear', price: 1899,
    images: ['https://images.unsplash.com/photo-1599058917212-97d0ce82a89a?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_004_s', size: 'Small', stock: 2 },
      { id: 'prd_004_m', size: 'Medium', stock: 6 },
      { id: 'prd_004_l', size: 'Large', stock: 4 },
    ],
    rating: 4.7, reviewCount: 19, createdAt: '2024-04-05T00:00:00Z',
  },
  {
    id: 'prd_005', name: 'IMPACT // HAND MITTS',
    description: 'Competition level padded hand protectors. Prevents hand and facial injuries during kumite.',
    category: 'gear', price: 1299,
    images: ['https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_005_s', size: 'Small', stock: 5 },
      { id: 'prd_005_m', size: 'Medium', stock: 8 },
      { id: 'prd_005_l', size: 'Large', stock: 0 },
    ],
    rating: 4.4, reviewCount: 25, createdAt: '2024-04-20T00:00:00Z',
  },
  {
    id: 'prd_006', name: 'HAULER // DUFFEL 40L',
    description: 'Spacious 40L duffel bag. Separate ventilated compartment for damp uniforms and side pockets for mouthguards.',
    category: 'merchandise', price: 2499,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_006_std', size: 'Standard (40L)', stock: 5 },
    ],
    rating: 4.9, reviewCount: 14, createdAt: '2024-05-15T00:00:00Z',
    requiresTier: 'silver'
  },
  {
    id: 'prd_007', name: 'STEEL HYDRATION FLASK',
    description: 'Double-walled insulated steel bottle keeps liquids cold for up to 24 hours. Engraved logo.',
    category: 'merchandise', price: 849,
    images: ['https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_007_750', size: '750ml', stock: 25 },
    ],
    rating: 4.3, reviewCount: 56, createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prd_008', name: 'BITEGUARD // PRO',
    description: 'Custom-moldable sports mouth guard with carry case. Essential for kumite sparring sessions.',
    category: 'gear', price: 399,
    images: ['https://images.unsplash.com/photo-1581009137142-3820cb7111fc?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'prd_008_jr', size: 'Junior', stock: 15 },
      { id: 'prd_008_sr', size: 'Senior', stock: 12 },
    ],
    rating: 4.2, reviewCount: 33, createdAt: '2024-07-10T00:00:00Z',
  }
]
