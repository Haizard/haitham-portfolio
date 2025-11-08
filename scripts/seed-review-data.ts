// scripts/seed-review-data.ts
// Script to seed test review data for the booking platform

import { createBookingReview } from '../src/lib/booking-reviews-data';

const sampleReviews = [
  // Hotel Reviews
  {
    bookingId: 'booking_hotel_001',
    userId: 'user_customer_001',
    reviewType: 'hotel' as const,
    targetId: 'property_001', // Replace with actual property ID
    ratings: {
      overall: 5,
      cleanliness: 5,
      service: 5,
      valueForMoney: 4,
      comfort: 5,
      location: 5,
    },
    comment: 'Absolutely amazing stay! The hotel exceeded all expectations. The room was spotless, the staff was incredibly friendly and helpful, and the location was perfect for exploring the city. The breakfast buffet was excellent with a wide variety of options. Would definitely stay here again!',
    userName: 'John Smith',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    bookingId: 'booking_hotel_002',
    userId: 'user_customer_002',
    reviewType: 'hotel' as const,
    targetId: 'property_001',
    ratings: {
      overall: 4,
      cleanliness: 4,
      service: 5,
      valueForMoney: 4,
      comfort: 4,
      location: 5,
    },
    comment: 'Great hotel with excellent service. The staff went above and beyond to make our stay comfortable. The only minor issue was that the room was a bit smaller than expected, but it was clean and well-maintained. Great location near all major attractions.',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    bookingId: 'booking_hotel_003',
    userId: 'user_customer_003',
    reviewType: 'hotel' as const,
    targetId: 'property_001',
    ratings: {
      overall: 3,
      cleanliness: 3,
      service: 4,
      valueForMoney: 3,
      comfort: 3,
      location: 4,
    },
    comment: 'Decent hotel for the price. The location is good and the staff is friendly. However, the room could use some updating and the Wi-Fi was quite slow. Breakfast was average. It\'s okay for a short stay but I would look for other options for a longer visit.',
    userName: 'Michael Chen',
    userAvatar: 'https://i.pravatar.cc/150?img=33',
  },

  // Car Rental Reviews
  {
    bookingId: 'booking_car_001',
    userId: 'user_customer_001',
    reviewType: 'car_rental' as const,
    targetId: 'vehicle_001', // Replace with actual vehicle ID
    ratings: {
      overall: 5,
      service: 5,
      valueForMoney: 5,
      comfort: 5,
      condition: 5,
    },
    comment: 'Perfect car rental experience! The vehicle was in excellent condition, clean, and exactly as described. The pickup and drop-off process was smooth and efficient. The car drove beautifully and was very comfortable for our road trip. Highly recommend!',
    userName: 'Emily Davis',
    userAvatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    bookingId: 'booking_car_002',
    userId: 'user_customer_002',
    reviewType: 'car_rental' as const,
    targetId: 'vehicle_001',
    ratings: {
      overall: 4,
      service: 4,
      valueForMoney: 4,
      comfort: 4,
      condition: 5,
    },
    comment: 'Good rental car. The vehicle was clean and well-maintained. Fuel efficiency was great. The only downside was a slight delay during pickup, but the staff was apologetic and professional. Overall a good experience.',
    userName: 'David Wilson',
    userAvatar: 'https://i.pravatar.cc/150?img=15',
  },

  // Transfer Reviews
  {
    bookingId: 'booking_transfer_001',
    userId: 'user_customer_003',
    reviewType: 'transfer' as const,
    targetId: 'transfer_vehicle_001', // Replace with actual transfer vehicle ID
    ratings: {
      overall: 5,
      service: 5,
      valueForMoney: 5,
      condition: 5,
    },
    comment: 'Excellent airport transfer service! The driver was punctual, professional, and very friendly. The vehicle was clean and comfortable. Made our arrival stress-free. Will definitely use this service again!',
    userName: 'Lisa Anderson',
    userAvatar: 'https://i.pravatar.cc/150?img=20',
  },
  {
    bookingId: 'booking_transfer_002',
    userId: 'user_customer_001',
    reviewType: 'transfer' as const,
    targetId: 'transfer_vehicle_001',
    ratings: {
      overall: 4,
      service: 5,
      valueForMoney: 4,
      condition: 4,
    },
    comment: 'Great transfer service. Driver was on time and very helpful with luggage. The vehicle was comfortable though a bit older than expected. Good value for money overall.',
    userName: 'Robert Martinez',
    userAvatar: 'https://i.pravatar.cc/150?img=11',
  },

  // Tour Reviews
  {
    bookingId: 'booking_tour_001',
    userId: 'user_customer_002',
    reviewType: 'tour' as const,
    targetId: 'tour_001', // Replace with actual tour ID
    ratings: {
      overall: 5,
      service: 5,
      valueForMoney: 5,
      experience: 5,
    },
    comment: 'Absolutely incredible tour! Our guide was knowledgeable, entertaining, and passionate about the history and culture. We saw so many amazing sights and learned so much. The itinerary was well-planned with perfect timing. This was the highlight of our trip!',
    userName: 'Jennifer Taylor',
    userAvatar: 'https://i.pravatar.cc/150?img=23',
  },
  {
    bookingId: 'booking_tour_002',
    userId: 'user_customer_003',
    reviewType: 'tour' as const,
    targetId: 'tour_001',
    ratings: {
      overall: 4,
      service: 4,
      valueForMoney: 4,
      experience: 5,
    },
    comment: 'Wonderful tour experience! The guide was excellent and the locations were breathtaking. The only minor issue was that the group was a bit large, making it sometimes hard to hear the guide. But overall, a fantastic day out!',
    userName: 'Christopher Brown',
    userAvatar: 'https://i.pravatar.cc/150?img=14',
  },
  {
    bookingId: 'booking_tour_003',
    userId: 'user_customer_001',
    reviewType: 'tour' as const,
    targetId: 'tour_001',
    ratings: {
      overall: 5,
      service: 5,
      valueForMoney: 5,
      experience: 5,
    },
    comment: 'Best tour we\'ve ever taken! The guide was amazing - so knowledgeable and funny. We visited places we never would have found on our own. The lunch included was delicious. Worth every penny. Can\'t recommend this enough!',
    userName: 'Amanda White',
    userAvatar: 'https://i.pravatar.cc/150?img=16',
  },
];

async function seedReviews() {
  console.log('🌱 Starting review data seeding...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const reviewData of sampleReviews) {
    try {
      const review = await createBookingReview(reviewData);
      console.log(`✅ Created ${reviewData.reviewType} review by ${reviewData.userName} (Rating: ${reviewData.ratings.overall}/5)`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed to create review: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Seeding Summary:`);
  console.log(`   ✅ Successfully created: ${successCount} reviews`);
  console.log(`   ❌ Failed: ${errorCount} reviews`);
  console.log(`\n🎉 Review seeding complete!`);
}

// Run the seeding function
seedReviews()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });

