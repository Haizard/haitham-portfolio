/**
 * Seed Flight Data Script
 * 
 * This script seeds the database with sample airports and airlines data
 * for testing the flight booking system.
 * 
 * Usage: npx tsx scripts/seed-flight-data.ts
 */

import { createAirport, createAirline } from '../src/lib/flights-data';

// Sample airports data
const airports = [
  // United States
  {
    name: 'John F. Kennedy International Airport',
    iataCode: 'JFK',
    icaoCode: 'KJFK',
    city: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.6413, longitude: -73.7781 },
  },
  {
    name: 'Los Angeles International Airport',
    iataCode: 'LAX',
    icaoCode: 'KLAX',
    city: 'Los Angeles',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 33.9416, longitude: -118.4085 },
  },
  {
    name: 'San Francisco International Airport',
    iataCode: 'SFO',
    icaoCode: 'KSFO',
    city: 'San Francisco',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
  },
  {
    name: 'Chicago O\'Hare International Airport',
    iataCode: 'ORD',
    icaoCode: 'KORD',
    city: 'Chicago',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 41.9742, longitude: -87.9073 },
  },
  {
    name: 'Miami International Airport',
    iataCode: 'MIA',
    icaoCode: 'KMIA',
    city: 'Miami',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 25.7959, longitude: -80.2870 },
  },

  // Europe
  {
    name: 'London Heathrow Airport',
    iataCode: 'LHR',
    icaoCode: 'EGLL',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    coordinates: { latitude: 51.4700, longitude: -0.4543 },
  },
  {
    name: 'Charles de Gaulle Airport',
    iataCode: 'CDG',
    icaoCode: 'LFPG',
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
    coordinates: { latitude: 49.0097, longitude: 2.5479 },
  },
  {
    name: 'Frankfurt Airport',
    iataCode: 'FRA',
    icaoCode: 'EDDF',
    city: 'Frankfurt',
    country: 'Germany',
    timezone: 'Europe/Berlin',
    coordinates: { latitude: 50.0379, longitude: 8.5622 },
  },
  {
    name: 'Amsterdam Airport Schiphol',
    iataCode: 'AMS',
    icaoCode: 'EHAM',
    city: 'Amsterdam',
    country: 'Netherlands',
    timezone: 'Europe/Amsterdam',
    coordinates: { latitude: 52.3105, longitude: 4.7683 },
  },

  // Asia
  {
    name: 'Tokyo Narita International Airport',
    iataCode: 'NRT',
    icaoCode: 'RJAA',
    city: 'Tokyo',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    coordinates: { latitude: 35.7720, longitude: 140.3929 },
  },
  {
    name: 'Dubai International Airport',
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    city: 'Dubai',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
    coordinates: { latitude: 25.2532, longitude: 55.3657 },
  },
  {
    name: 'Singapore Changi Airport',
    iataCode: 'SIN',
    icaoCode: 'WSSS',
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    coordinates: { latitude: 1.3644, longitude: 103.9915 },
  },
  {
    name: 'Hong Kong International Airport',
    iataCode: 'HKG',
    icaoCode: 'VHHH',
    city: 'Hong Kong',
    country: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
    coordinates: { latitude: 22.3080, longitude: 113.9185 },
  },

  // Australia
  {
    name: 'Sydney Kingsford Smith Airport',
    iataCode: 'SYD',
    icaoCode: 'YSSY',
    city: 'Sydney',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    coordinates: { latitude: -33.9399, longitude: 151.1753 },
  },
];

// Sample airlines data
const airlines = [
  {
    name: 'American Airlines',
    iataCode: 'AA',
    icaoCode: 'AAL',
    country: 'United States',
    logo: 'https://images.kiwi.com/airlines/64/AA.png',
    isActive: true,
  },
  {
    name: 'Delta Air Lines',
    iataCode: 'DL',
    icaoCode: 'DAL',
    country: 'United States',
    logo: 'https://images.kiwi.com/airlines/64/DL.png',
    isActive: true,
  },
  {
    name: 'United Airlines',
    iataCode: 'UA',
    icaoCode: 'UAL',
    country: 'United States',
    logo: 'https://images.kiwi.com/airlines/64/UA.png',
    isActive: true,
  },
  {
    name: 'Southwest Airlines',
    iataCode: 'WN',
    icaoCode: 'SWA',
    country: 'United States',
    logo: 'https://images.kiwi.com/airlines/64/WN.png',
    isActive: true,
  },
  {
    name: 'British Airways',
    iataCode: 'BA',
    icaoCode: 'BAW',
    country: 'United Kingdom',
    logo: 'https://images.kiwi.com/airlines/64/BA.png',
    isActive: true,
  },
  {
    name: 'Air France',
    iataCode: 'AF',
    icaoCode: 'AFR',
    country: 'France',
    logo: 'https://images.kiwi.com/airlines/64/AF.png',
    isActive: true,
  },
  {
    name: 'Lufthansa',
    iataCode: 'LH',
    icaoCode: 'DLH',
    country: 'Germany',
    logo: 'https://images.kiwi.com/airlines/64/LH.png',
    isActive: true,
  },
  {
    name: 'Emirates',
    iataCode: 'EK',
    icaoCode: 'UAE',
    country: 'United Arab Emirates',
    logo: 'https://images.kiwi.com/airlines/64/EK.png',
    isActive: true,
  },
  {
    name: 'Singapore Airlines',
    iataCode: 'SQ',
    icaoCode: 'SIA',
    country: 'Singapore',
    logo: 'https://images.kiwi.com/airlines/64/SQ.png',
    isActive: true,
  },
  {
    name: 'Cathay Pacific',
    iataCode: 'CX',
    icaoCode: 'CPA',
    country: 'Hong Kong',
    logo: 'https://images.kiwi.com/airlines/64/CX.png',
    isActive: true,
  },
  {
    name: 'Qantas',
    iataCode: 'QF',
    icaoCode: 'QFA',
    country: 'Australia',
    logo: 'https://images.kiwi.com/airlines/64/QF.png',
    isActive: true,
  },
  {
    name: 'Japan Airlines',
    iataCode: 'JL',
    icaoCode: 'JAL',
    country: 'Japan',
    logo: 'https://images.kiwi.com/airlines/64/JL.png',
    isActive: true,
  },
];

async function seedFlightData() {
  console.log('🛫 Starting flight data seeding...\n');

  try {
    // Seed airports
    console.log('📍 Seeding airports...');
    let airportCount = 0;
    for (const airport of airports) {
      try {
        await createAirport(airport);
        airportCount++;
        console.log(`  ✓ ${airport.name} (${airport.iataCode})`);
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          console.log(`  ⊘ ${airport.name} (${airport.iataCode}) - already exists`);
        } else {
          console.error(`  ✗ ${airport.name} (${airport.iataCode}) - ${error.message}`);
        }
      }
    }
    console.log(`\n✅ Seeded ${airportCount} airports\n`);

    // Seed airlines
    console.log('✈️  Seeding airlines...');
    let airlineCount = 0;
    for (const airline of airlines) {
      try {
        await createAirline(airline);
        airlineCount++;
        console.log(`  ✓ ${airline.name} (${airline.iataCode})`);
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          console.log(`  ⊘ ${airline.name} (${airline.iataCode}) - already exists`);
        } else {
          console.error(`  ✗ ${airline.name} (${airline.iataCode}) - ${error.message}`);
        }
      }
    }
    console.log(`\n✅ Seeded ${airlineCount} airlines\n`);

    console.log('🎉 Flight data seeding complete!');
    console.log(`\nSummary:`);
    console.log(`  - Airports: ${airportCount} created`);
    console.log(`  - Airlines: ${airlineCount} created`);
    console.log(`\nYou can now:`);
    console.log(`  1. Search for flights at /flights`);
    console.log(`  2. View airports at /api/flights/airports`);
    console.log(`  3. View airlines at /api/flights/airlines`);

  } catch (error) {
    console.error('❌ Error seeding flight data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFlightData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

