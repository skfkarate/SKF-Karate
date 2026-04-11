export interface ProductVariant {
    id: string
    size: string
    stock: number
}

export interface Product {
    id: string
    name: string
    description: string
    category: 'uniforms' | 'belts' | 'gear' | 'merchandise'
    price: number
    images: string[]
    variants: ProductVariant[]
}

export const PRODUCTS: Product[] = [
    {
        id: 'gi-white',
        name: 'SKF White Gi (Uniform)',
        description: 'Official SKF competition-grade white karate gi. Lightweight, durable, and highly breathable. Approved for all domestic and international WKF tournaments.',
        category: 'uniforms',
        price: 1200,
        images: ['/shop/gi-white.jpg'],
        variants: [
            { id: 'gi-white-xs', size: 'XS (130cm)', stock: 5 },
            { id: 'gi-white-s',  size: 'S (140cm)',  stock: 8 },
            { id: 'gi-white-m',  size: 'M (150cm)',  stock: 10 },
            { id: 'gi-white-l',  size: 'L (160cm)',  stock: 7 },
            { id: 'gi-white-xl', size: 'XL (170cm)', stock: 4 },
        ]
    },
    {
        id: 'belt-standard',
        name: 'SKF Standard Belt',
        description: 'High-quality cotton blend standard grading belts. Holds color firmly even after multiple washes.',
        category: 'belts',
        price: 150,
        images: ['/shop/belt.jpg'],
        variants: [
            { id: 'belt-white', size: 'White', stock: 20 },
            { id: 'belt-yellow', size: 'Yellow', stock: 15 },
            { id: 'belt-orange', size: 'Orange', stock: 15 },
            { id: 'belt-green', size: 'Green', stock: 10 },
            { id: 'belt-blue', size: 'Blue', stock: 10 },
            { id: 'belt-brown', size: 'Brown', stock: 5 },
            { id: 'belt-black', size: 'Black', stock: 3 },
        ]
    },
    {
        id: 'skf-tshirt',
        name: 'SKF Premium T-Shirt',
        description: 'Show your team spirit! Premium cotton t-shirt with classic SKF logo. Perfect for casual wear and warmups.',
        category: 'merchandise',
        price: 499,
        images: ['/shop/tshirt.jpg'],
        variants: [
            { id: 'tshirt-s', size: 'S', stock: 0 }, // specifically 0 to test out of stock badge
            { id: 'tshirt-m', size: 'M', stock: 12 },
            { id: 'tshirt-l', size: 'L', stock: 8 },
        ]
    },
    {
        id: 'gear-shin-guards',
        name: 'WKF Approved Shin Guards',
        description: 'Elite protective gear designed for full-contact impact distribution. Removable foot protectors.',
        category: 'gear',
        price: 899,
        images: ['/shop/shin-guards.jpg'],
        variants: [
            { id: 'shin-s', size: 'Small', stock: 2 }, // low stock testing
            { id: 'shin-m', size: 'Medium', stock: 6 },
            { id: 'shin-l', size: 'Large', stock: 4 },
        ]
    },
    {
        id: 'gear-hand-mitts',
        name: 'WKF Approved Hand Mitts',
        description: 'Competition level padded hand protectors. Prevents hand and facial injuries during kumite.',
        category: 'gear',
        price: 699,
        images: ['/shop/hand-mitts.jpg'],
        variants: [
            { id: 'mitt-s', size: 'Small', stock: 5 },
            { id: 'mitt-m', size: 'Medium', stock: 8 },
            { id: 'mitt-l', size: 'Large', stock: 5 },
        ]
    },
    {
        id: 'skf-gym-bag',
        name: 'SKF Tactical Gym Bag',
        description: 'Spacious 40L duffel bag. Separate ventilated compartment for damp uniforms and side pockets for mouthguards.',
        category: 'merchandise',
        price: 1299,
        images: ['/shop/bag.jpg'],
        variants: [
            { id: 'bag-standard', size: 'Standard (40L)', stock: 5 },
        ]
    },
    {
        id: 'skf-water-bottle',
        name: 'SKF Insulated Water Bottle',
        description: 'Double-walled insulated steel bottle keeps liquids cold for up to 24 hours. Engraved logo.',
        category: 'merchandise',
        price: 349,
        images: ['/shop/water-bottle.jpg'],
        variants: [
            { id: 'bottle-750', size: '750ml', stock: 25 },
        ]
    }
]
