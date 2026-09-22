import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order (respecting foreign keys)
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.faq.deleteMany();

  // Hotel
  await prisma.hotel.create({
    data: {
      id: 'hotel-001',
      name: 'Empire Heritage Hotels',
      description:
        'A luxury heritage hotel offering stunning views, world-class dining, and exceptional hospitality. Located in the heart of the city with easy access to local attractions.',
      address: '123 Heritage Boulevard, Bengaluru, KA 560001',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      contact: '+91 80 1234 5678 | reservations@empirehotels.in',
    },
  });

  // Room Types
  await prisma.roomType.create({
    data: {
      id: 'room-standard',
      name: 'Standard Room',
      description:
        'Comfortable room with city views, perfect for solo travelers or couples.',
      maxAdults: 2,
      maxOccupancy: 2,
      pricePerNight: 129.0,
      bedType: 'Queen',
      totalUnits: 20,
      amenities: [
        'Free Wi-Fi',
        'Air conditioning',
        'Flat-screen TV',
        'Mini fridge',
        'Coffee maker',
      ],
    },
  });

  await prisma.roomType.create({
    data: {
      id: 'room-deluxe',
      name: 'Deluxe Ocean View',
      description:
        'Spacious room with panoramic ocean views and premium furnishings.',
      maxAdults: 2,
      maxOccupancy: 3,
      pricePerNight: 219.0,
      bedType: 'King',
      totalUnits: 15,
      amenities: [
        'Free Wi-Fi',
        'Air conditioning',
        'Flat-screen TV',
        'Mini bar',
        'Coffee maker',
        'Balcony',
        'Ocean view',
        'Bathrobes',
      ],
    },
  });

  await prisma.roomType.create({
    data: {
      id: 'room-family',
      name: 'Family Suite',
      description:
        'Large suite with separate living area, ideal for families. Sleeps up to 3 adults or 2 adults and 2 children.',
      maxAdults: 3,
      maxOccupancy: 4,
      pricePerNight: 349.0,
      bedType: 'King + Twin',
      totalUnits: 8,
      amenities: [
        'Free Wi-Fi',
        'Air conditioning',
        'Two flat-screen TVs',
        'Full mini bar',
        'Coffee maker',
        'Separate living area',
        'Ocean view',
        'Bathrobes',
        'Kitchenette',
      ],
    },
  });

  await prisma.roomType.create({
    data: {
      id: 'room-penthouse',
      name: 'Penthouse Suite',
      description:
        'Our finest accommodation with wraparound terrace, private jacuzzi, and butler service.',
      maxAdults: 2,
      maxOccupancy: 3,
      pricePerNight: 599.0,
      bedType: 'California King',
      totalUnits: 2,
      amenities: [
        'Free Wi-Fi',
        'Air conditioning',
        'Smart TV',
        'Premium mini bar',
        'Espresso machine',
        'Wraparound terrace',
        'Private jacuzzi',
        'Butler service',
        'Ocean view',
        'Bathrobes',
        'Nespresso machine',
      ],
    },
  });

  // Amenities
  await prisma.amenity.createMany({
    data: [
      {
        id: 'amenity-pool',
        name: 'Outdoor Swimming Pool',
        description:
          'Heated infinity pool overlooking the ocean with sun loungers and poolside bar service.',
        hours: '7:00 AM - 10:00 PM daily',
        extraCost: null,
      },
      {
        id: 'amenity-breakfast',
        name: 'Breakfast Buffet',
        description:
          'International breakfast buffet at The Empire Heritage Restaurant featuring fresh pastries, made-to-order eggs, tropical fruits, and barista coffee. Breakfast is NOT included in the room rate and is available as a paid add-on.',
        hours: '6:30 AM - 10:30 AM daily',
        extraCost: 25.0,
      },
      {
        id: 'amenity-gym',
        name: 'Fitness Center',
        description:
          'Fully equipped gym with cardio machines, free weights, and yoga mats.',
        hours: '24 hours',
        extraCost: null,
      },
      {
        id: 'amenity-spa',
        name: 'Heritage Spa',
        description:
          'Full-service spa offering massages, facials, and body treatments. Reservation required.',
        hours: '9:00 AM - 8:00 PM daily',
        extraCost: null,
      },
      {
        id: 'amenity-parking',
        name: 'Parking',
        description:
          'Secure underground parking garage with valet service available.',
        hours: '24 hours',
        extraCost: 15.0,
      },
      {
        id: 'amenity-wifi',
        name: 'Wi-Fi',
        description:
          'Complimentary high-speed Wi-Fi throughout the hotel.',
        hours: '24 hours',
        extraCost: null,
      },
    ],
  });

  // Policies
  await prisma.policy.createMany({
    data: [
      {
        id: 'policy-cancellation',
        key: 'cancellation',
        title: 'Cancellation Policy',
        content:
          "Free cancellation up to 48 hours before check-in. Cancellations made within 48 hours of check-in will be charged the first night's room rate. No-shows will be charged the full reservation amount.",
      },
      {
        id: 'policy-breakfast',
        key: 'breakfast',
        title: 'Breakfast Policy',
        content:
          'Breakfast is NOT included in the room rate. A full breakfast buffet is available at The Empire Heritage Restaurant for ₹25 per person per day. Children under 5 eat free. Half-board and full-board packages can be arranged at check-in.',
      },
      {
        id: 'policy-pets',
        key: 'pets',
        title: 'Pet Policy',
        content:
          'We welcome small pets (under 10 kg) in Standard and Deluxe rooms only. A pet fee of ₹30 per night applies. Service animals are welcome in all room types at no extra charge. Please notify us in advance.',
      },
      {
        id: 'policy-payment',
        key: 'payment',
        title: 'Payment Policy',
        content:
          'We accept Visa, MasterCard, American Express, and Discover. A valid credit card is required at check-in. A security deposit of ₹100 per night (up to ₹500) will be pre-authorized and released within 5-7 business days after check-out.',
      },
      {
        id: 'policy-checkin',
        key: 'checkin',
        title: 'Check-in / Check-out Policy',
        content:
          'Check-in time is 2:00 PM (14:00). Check-out time is 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges. Please contact the front desk for requests.',
      },
      {
        id: 'policy-children',
        key: 'children',
        title: 'Children Policy',
        content:
          'Children of all ages are welcome. Children under 12 stay free when using existing bedding. Extra beds/cribs can be arranged for ₹20 per night. Our Family Suite is specifically designed for families with children.',
      },
    ],
  });

  // FAQs
  await prisma.faq.createMany({
    data: [
      {
        id: 'faq-checkin-time',
        question: 'What time is check-in and check-out?',
        answer:
          'Check-in is at 2:00 PM (14:00) and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability.',
        tags: ['check-in', 'check-out', 'time', 'hours'],
      },
      {
        id: 'faq-pool',
        question: 'Does the hotel have a pool?',
        answer:
          'Yes! We have a heated infinity pool overlooking the ocean, open daily from 7:00 AM to 10:00 PM. Pool towels and sun loungers are complimentary. Poolside bar service is available.',
        tags: ['pool', 'swimming', 'amenities'],
      },
      {
        id: 'faq-breakfast',
        question: 'Is breakfast included in the room rate?',
        answer:
          'Breakfast is NOT included in the room rate. Our international breakfast buffet is available at The Empire Heritage Restaurant for ₹25 per person per day (children under 5 eat free). Half-board packages can be arranged at check-in.',
        tags: ['breakfast', 'food', 'dining', 'included'],
      },
      {
        id: 'faq-cancellation',
        question: 'What is the cancellation policy?',
        answer:
          "We offer free cancellation up to 48 hours before check-in. Cancellations within 48 hours are charged the first night's rate. No-shows are charged the full amount.",
        tags: ['cancellation', 'cancel', 'refund', 'policy'],
      },
      {
        id: 'faq-parking',
        question: 'Is there parking available?',
        answer:
          'Yes, we have a secure underground parking garage available for ₹15 per night. Valet parking service is also available. Electric vehicle charging stations are provided.',
        tags: ['parking', 'car', 'valet', 'EV'],
      },
      {
        id: 'faq-wifi',
        question: 'Is Wi-Fi free?',
        answer:
          'Yes, complimentary high-speed Wi-Fi is available throughout the hotel, including all guest rooms, lobby, pool area, and restaurant.',
        tags: ['wifi', 'internet', 'free'],
      },
      {
        id: 'faq-pets',
        question: 'Can I bring my pet?',
        answer:
          'Small pets under 10 kg are welcome in Standard and Deluxe rooms for ₹30/night. Service animals are welcome everywhere at no charge. Please notify us in advance.',
        tags: ['pets', 'dog', 'cat', 'animals'],
      },
      {
        id: 'faq-airport',
        question: 'Do you offer airport transfers?',
        answer:
          'Yes, we offer airport shuttle service for ₹45 one-way or ₹80 round-trip. Please book at least 24 hours in advance through the front desk or by calling +91 98765 43210.',
        tags: ['airport', 'transfer', 'shuttle', 'transport'],
      },
      {
        id: 'faq-3guests',
        question: 'Do you have rooms for 3 guests?',
        answer:
          'Yes! Our Deluxe Ocean View room accommodates up to 3 guests (2 adults + 1 on extra bed), and our Family Suite comfortably sleeps 3 adults. The Penthouse Suite also accommodates 3 guests.',
        tags: ['guests', 'occupancy', 'three', 'family', 'group'],
      },
      {
        id: 'faq-spa',
        question: 'Does the hotel have a spa?',
        answer:
          'Yes, the Heritage Spa offers a full range of treatments including massages, facials, and body treatments. Open daily 9 AM - 8 PM. We recommend booking treatments in advance.',
        tags: ['spa', 'massage', 'wellness', 'treatment'],
      },
    ],
  });

  // Sample Bookings (to affect availability)
  const bookings = [
    // Standard room bookings
    { roomTypeId: 'room-standard', checkIn: new Date('2026-09-25'), checkOut: new Date('2026-09-28'), status: 'confirmed' },
    { roomTypeId: 'room-standard', checkIn: new Date('2026-09-26'), checkOut: new Date('2026-09-30'), status: 'confirmed' },
    { roomTypeId: 'room-standard', checkIn: new Date('2026-09-27'), checkOut: new Date('2026-10-01'), status: 'confirmed' },
    // Deluxe bookings
    { roomTypeId: 'room-deluxe', checkIn: new Date('2026-09-25'), checkOut: new Date('2026-09-29'), status: 'confirmed' },
    { roomTypeId: 'room-deluxe', checkIn: new Date('2026-09-26'), checkOut: new Date('2026-09-28'), status: 'confirmed' },
    // Family suite bookings
    { roomTypeId: 'room-family', checkIn: new Date('2026-09-25'), checkOut: new Date('2026-09-30'), status: 'confirmed' },
    { roomTypeId: 'room-family', checkIn: new Date('2026-09-27'), checkOut: new Date('2026-10-02'), status: 'confirmed' },
    { roomTypeId: 'room-family', checkIn: new Date('2026-09-28'), checkOut: new Date('2026-10-01'), status: 'confirmed' },
    // Penthouse bookings (only 2 units so nearly full)
    { roomTypeId: 'room-penthouse', checkIn: new Date('2026-09-25'), checkOut: new Date('2026-09-30'), status: 'confirmed' },
    { roomTypeId: 'room-penthouse', checkIn: new Date('2026-09-26'), checkOut: new Date('2026-10-03'), status: 'confirmed' },
    // Cancelled booking (should not count against availability)
    { roomTypeId: 'room-standard', checkIn: new Date('2026-09-25'), checkOut: new Date('2026-09-28'), status: 'cancelled' },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({ data: booking });
  }

  // Menu Categories & Items
  const categories = [
    { id: 'cat-starters', name: 'Starters', description: 'Begin your meal with our delightful appetizers' },
    { id: 'cat-kebabs', name: 'Kebabs', description: 'Sizzling hot treats straight from the tandoor' },
    { id: 'cat-curries', name: 'Curries', description: 'Rich and authentic gravies' },
    { id: 'cat-biryani', name: 'Biryani', description: 'Fragrant basmati rice cooked with aromatic spices' },
    { id: 'cat-breads', name: 'Breads', description: 'Fresh Indian breads' },
    { id: 'cat-desserts', name: 'Desserts', description: 'Sweet endings' },
    { id: 'cat-beverages', name: 'Beverages', description: 'Refreshing drinks' },
  ];

  await prisma.menuCategory.createMany({ data: categories });

  const menuItems = [
    // Starters
    { categoryId: 'cat-starters', name: 'Paneer Tikka', description: 'Cubes of cottage cheese marinated in yogurt and spices', price: 290, isVeg: true, spiceLevel: 1, isBestseller: true },
    { categoryId: 'cat-starters', name: 'Gobi 65', description: 'Crispy fried cauliflower florets tossed in southern spices', price: 240, isVeg: true, spiceLevel: 2, isBestseller: false },
    { categoryId: 'cat-starters', name: 'Chicken 65', description: 'Spicy, deep-fried chicken bites', price: 320, isVeg: false, spiceLevel: 2, isBestseller: true },
    { categoryId: 'cat-starters', name: 'Mutton Pepper Fry', description: 'Tender mutton pieces slow-roasted with black pepper', price: 450, isVeg: false, spiceLevel: 3, isBestseller: false },
    // Kebabs
    { categoryId: 'cat-kebabs', name: 'Chicken Tikka Kebab', description: 'Tender chicken pieces baked in tandoor', price: 340, isVeg: false, spiceLevel: 1, isBestseller: true },
    { categoryId: 'cat-kebabs', name: 'Mutton Seekh Kebab', description: 'Minced mutton skewered and grilled', price: 420, isVeg: false, spiceLevel: 2, isBestseller: false },
    { categoryId: 'cat-kebabs', name: 'Hara Bhara Kebab', description: 'Spinach and green peas patties', price: 280, isVeg: true, spiceLevel: 1, isBestseller: false },
    // Curries
    { categoryId: 'cat-curries', name: 'Butter Chicken', description: 'Classic chicken in a rich tomato gravy', price: 380, isVeg: false, spiceLevel: 1, isBestseller: true },
    { categoryId: 'cat-curries', name: 'Mutton Rogan Josh', description: 'Aromatic Kashmiri mutton curry', price: 460, isVeg: false, spiceLevel: 2, isBestseller: true },
    { categoryId: 'cat-curries', name: 'Paneer Butter Masala', description: 'Cottage cheese in a creamy tomato sauce', price: 320, isVeg: true, spiceLevel: 1, isBestseller: true },
    { categoryId: 'cat-curries', name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight', price: 260, isVeg: true, spiceLevel: 0, isBestseller: true },
    { categoryId: 'cat-curries', name: 'Kadai Veg', description: 'Mixed vegetables in a spicy onion-tomato gravy', price: 280, isVeg: true, spiceLevel: 2, isBestseller: false },
    // Biryani
    { categoryId: 'cat-biryani', name: 'Chicken Dum Biryani', description: 'Signature biryani cooked with tender chicken', price: 350, isVeg: false, spiceLevel: 2, isBestseller: true },
    { categoryId: 'cat-biryani', name: 'Mutton Dum Biryani', description: 'Rich biryani layered with succulent mutton', price: 450, isVeg: false, spiceLevel: 2, isBestseller: true },
    { categoryId: 'cat-biryani', name: 'Veg Biryani', description: 'Aromatic basmati rice with mixed vegetables', price: 290, isVeg: true, spiceLevel: 1, isBestseller: false },
    // Breads
    { categoryId: 'cat-breads', name: 'Butter Naan', description: 'Soft leavened bread brushed with butter', price: 60, isVeg: true, spiceLevel: 0, isBestseller: true },
    { categoryId: 'cat-breads', name: 'Garlic Naan', description: 'Naan topped with minced garlic', price: 75, isVeg: true, spiceLevel: 0, isBestseller: true },
    { categoryId: 'cat-breads', name: 'Tandoori Roti', description: 'Whole wheat bread baked in tandoor', price: 40, isVeg: true, spiceLevel: 0, isBestseller: false },
    { categoryId: 'cat-breads', name: 'Roomali Roti', description: 'Thin, handkerchief-like bread', price: 50, isVeg: true, spiceLevel: 0, isBestseller: false },
    // Desserts
    { categoryId: 'cat-desserts', name: 'Gulab Jamun', description: 'Milk solids balls deep-fried and soaked in syrup', price: 120, isVeg: true, spiceLevel: 0, isBestseller: true },
    { categoryId: 'cat-desserts', name: 'Rasmalai', description: 'Soft paneer discs in sweetened milk', price: 150, isVeg: true, spiceLevel: 0, isBestseller: true },
    { categoryId: 'cat-desserts', name: 'Gajar Ka Halwa', description: 'Carrot pudding with nuts', price: 140, isVeg: true, spiceLevel: 0, isBestseller: false },
    // Beverages
    { categoryId: 'cat-beverages', name: 'Sweet Lassi', description: 'Refreshing yogurt drink', price: 110, isVeg: true, spiceLevel: 0, isBestseller: true },
    { categoryId: 'cat-beverages', name: 'Fresh Lime Soda', description: 'Tangy lime soda', price: 90, isVeg: true, spiceLevel: 0, isBestseller: false },
    { categoryId: 'cat-beverages', name: 'Masala Chai', description: 'Indian spiced tea', price: 60, isVeg: true, spiceLevel: 0, isBestseller: true },
  ];

  await prisma.menuItem.createMany({ data: menuItems });

  console.log('✅ Seed data inserted successfully!');
  console.log('  - 1 hotel');
  console.log('  - 4 room types');
  console.log('  - 6 amenities');
  console.log('  - 6 policies');
  console.log('  - 10 FAQs');
  console.log('  - 11 bookings (10 confirmed + 1 cancelled)');
  console.log('  - 7 menu categories');
  console.log('  - 25 menu items');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
