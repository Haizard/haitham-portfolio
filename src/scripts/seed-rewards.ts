import clientPromise from '../lib/mongodb';

const SAMPLE_REWARDS = [
  {
    name: '10% Off Hotel Booking',
    description: 'Get 10% discount on your next hotel booking. Valid for bookings over $100.',
    pointsCost: 500,
    rewardType: 'discount',
    discountType: 'percentage',
    discountValue: 10,
    applicableTo: ['property'],
    minBookingValue: 100,
    maxRedemptions: 5,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    termsAndConditions: 'Valid for bookings over $100. Cannot be combined with other offers.',
  },
  {
    name: '$25 Off Car Rental',
    description: 'Save $25 on your next car rental. Minimum 3-day rental required.',
    pointsCost: 750,
    rewardType: 'discount',
    discountType: 'fixed',
    discountValue: 25,
    applicableTo: ['vehicle'],
    minBookingValue: 150,
    maxRedemptions: 3,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Minimum 3-day rental required. Valid for standard and premium vehicles.',
  },
  {
    name: 'Free Room Upgrade',
    description: 'Complimentary room upgrade to the next category (subject to availability).',
    pointsCost: 1000,
    rewardType: 'upgrade',
    applicableTo: ['property'],
    minBookingValue: 200,
    maxRedemptions: 2,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Subject to availability. Must be requested at time of booking.',
  },
  {
    name: '15% Off Tour Package',
    description: 'Enjoy 15% discount on any tour or activity booking.',
    pointsCost: 600,
    rewardType: 'discount',
    discountType: 'percentage',
    discountValue: 15,
    applicableTo: ['tour'],
    minBookingValue: 75,
    maxRedemptions: 4,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Valid for all tour packages. Cannot be combined with other discounts.',
  },
  {
    name: 'Free Airport Transfer',
    description: 'Complimentary one-way airport transfer with any hotel booking.',
    pointsCost: 800,
    rewardType: 'freebie',
    applicableTo: ['transfer'],
    minBookingValue: 0,
    maxRedemptions: 2,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Must be booked together with a hotel reservation. Standard vehicles only.',
  },
  {
    name: '$50 Travel Voucher',
    description: 'Flexible $50 voucher applicable to any booking type.',
    pointsCost: 1500,
    rewardType: 'voucher',
    discountType: 'fixed',
    discountValue: 50,
    applicableTo: ['property', 'vehicle', 'tour', 'transfer', 'flight'],
    minBookingValue: 200,
    maxRedemptions: 1,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days
    termsAndConditions: 'Valid for 180 days. Minimum booking value $200. One per customer.',
  },
  {
    name: '20% Off Multi-Service Bundle',
    description: 'Book hotel + car rental together and save 20% on the total.',
    pointsCost: 1200,
    rewardType: 'discount',
    discountType: 'percentage',
    discountValue: 20,
    applicableTo: ['property', 'vehicle'],
    minBookingValue: 300,
    maxRedemptions: 2,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Must book hotel and car rental together. Minimum combined value $300.',
  },
  {
    name: 'Premium Car Upgrade',
    description: 'Upgrade to a premium or luxury vehicle at no extra cost.',
    pointsCost: 2000,
    rewardType: 'upgrade',
    applicableTo: ['vehicle'],
    minBookingValue: 250,
    maxRedemptions: 1,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Subject to availability. Minimum 5-day rental. Insurance not included.',
  },
  {
    name: 'VIP Tour Experience',
    description: 'Upgrade any tour to VIP experience with private guide and exclusive access.',
    pointsCost: 2500,
    rewardType: 'upgrade',
    applicableTo: ['tour'],
    minBookingValue: 200,
    maxRedemptions: 1,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    termsAndConditions: 'Subject to availability. Must be requested 48 hours in advance.',
  },
  {
    name: '$100 Ultimate Travel Voucher',
    description: 'Premium voucher worth $100 for any booking. The ultimate reward!',
    pointsCost: 3000,
    rewardType: 'voucher',
    discountType: 'fixed',
    discountValue: 100,
    applicableTo: ['property', 'vehicle', 'tour', 'transfer', 'flight'],
    minBookingValue: 400,
    maxRedemptions: 1,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    termsAndConditions: 'Valid for 1 year. Minimum booking value $400. One per customer per year.',
  },
];

async function seedRewards() {
  try {
    const client = await clientPromise;
    const db = client.db();

    console.log('🌱 Seeding rewards...');

    // Clear existing rewards
    await db.collection('rewards').deleteMany({});
    console.log('✅ Cleared existing rewards');

    // Insert sample rewards
    const now = new Date().toISOString();
    const rewardsWithTimestamps = SAMPLE_REWARDS.map((reward) => ({
      ...reward,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await db.collection('rewards').insertMany(rewardsWithTimestamps);
    console.log(`✅ Inserted ${result.insertedCount} rewards`);

    console.log('\n📊 Rewards Summary:');
    console.log(`- Discount rewards: ${SAMPLE_REWARDS.filter((r) => r.rewardType === 'discount').length}`);
    console.log(`- Upgrade rewards: ${SAMPLE_REWARDS.filter((r) => r.rewardType === 'upgrade').length}`);
    console.log(`- Freebie rewards: ${SAMPLE_REWARDS.filter((r) => r.rewardType === 'freebie').length}`);
    console.log(`- Voucher rewards: ${SAMPLE_REWARDS.filter((r) => r.rewardType === 'voucher').length}`);

    console.log('\n🎉 Rewards seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding rewards:', error);
    process.exit(1);
  }
}

seedRewards();

