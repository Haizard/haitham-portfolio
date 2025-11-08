/**
 * Seed Test Data Script
 * 
 * This script creates test data for:
 * - Hotels (properties and rooms)
 * - Car rentals (vehicles)
 * 
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';

// Test user IDs (you'll need to create these users first or use existing ones)
const TEST_PROPERTY_OWNER_ID = 'test-property-owner-id';
const TEST_CAR_OWNER_ID = 'test-car-owner-id';

async function seedHotels() {
  console.log('🏨 Seeding hotel data...');
  
  const propertiesCollection = await getCollection('properties');
  const roomsCollection = await getCollection('rooms');

  // Create test properties
  const properties = [
    {
      _id: new ObjectId(),
      ownerId: TEST_PROPERTY_OWNER_ID,
      name: 'Grand Plaza Hotel',
      type: 'hotel',
      description: 'Luxury hotel in the heart of downtown with stunning city views and world-class amenities.',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      contactInfo: {
        phone: '+1-212-555-0100',
        email: 'info@grandplaza.com',
        website: 'https://grandplaza.com',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Hotel Exterior', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', caption: 'Lobby', isPrimary: false, order: 1 },
      ],
      amenities: ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'bar', 'spa', 'room_service', 'concierge'],
      policies: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellationPolicy: 'moderate',
        petPolicy: 'not_allowed',
        smokingPolicy: 'non_smoking',
      },
      starRating: 5,
      averageRating: 4.7,
      reviewCount: 342,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      ownerId: TEST_PROPERTY_OWNER_ID,
      name: 'Beachside Resort & Spa',
      type: 'resort',
      description: 'Tropical paradise with private beach access, infinity pools, and award-winning restaurants.',
      address: '456 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      zipCode: '33139',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      contactInfo: {
        phone: '+1-305-555-0200',
        email: 'reservations@beachsideresort.com',
        website: 'https://beachsideresort.com',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', caption: 'Resort View', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', caption: 'Beach', isPrimary: false, order: 1 },
      ],
      amenities: ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'bar', 'spa', 'beach_access', 'water_sports'],
      policies: {
        checkInTime: '16:00',
        checkOutTime: '12:00',
        cancellationPolicy: 'strict',
        petPolicy: 'allowed',
        smokingPolicy: 'designated_areas',
      },
      starRating: 5,
      averageRating: 4.9,
      reviewCount: 567,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      ownerId: TEST_PROPERTY_OWNER_ID,
      name: 'Downtown Apartments',
      type: 'apartment',
      description: 'Modern serviced apartments perfect for extended stays with full kitchen and living areas.',
      address: '789 Park Avenue',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90012',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      contactInfo: {
        phone: '+1-213-555-0300',
        email: 'info@downtownapts.com',
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', caption: 'Apartment Building', isPrimary: true, order: 0 },
      ],
      amenities: ['wifi', 'parking', 'gym', 'kitchen', 'washer_dryer', 'balcony'],
      policies: {
        checkInTime: '14:00',
        checkOutTime: '10:00',
        cancellationPolicy: 'flexible',
        petPolicy: 'allowed',
        smokingPolicy: 'non_smoking',
      },
      starRating: 4,
      averageRating: 4.5,
      reviewCount: 128,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const insertedProperties = await propertiesCollection.insertMany(properties);
  console.log(`✅ Created ${insertedProperties.insertedCount} properties`);

  // Create rooms for each property
  const rooms = [];

  // Grand Plaza Hotel - Rooms
  const grandPlazaId = properties[0]._id.toString();
  rooms.push(
    {
      _id: new ObjectId(),
      propertyId: grandPlazaId,
      name: 'Deluxe King Room',
      type: 'deluxe',
      description: 'Spacious room with king bed, city views, and luxury amenities.',
      maxOccupancy: { adults: 2, children: 1, infants: 1 },
      bedConfiguration: [{ type: 'king', count: 1 }],
      size: 35,
      sizeUnit: 'sqm',
      images: [
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', caption: 'Room View', isPrimary: true, order: 0 },
      ],
      amenities: ['wifi', 'tv', 'minibar', 'safe', 'coffee_maker', 'air_conditioning', 'city_view'],
      pricing: {
        basePrice: 250,
        currency: 'USD',
        taxRate: 0.12,
        cleaningFee: 30,
        extraGuestFee: 25,
      },
      availability: {
        isAvailable: true,
        totalRooms: 10,
        availableRooms: 7,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      propertyId: grandPlazaId,
      name: 'Executive Suite',
      type: 'suite',
      description: 'Luxurious suite with separate living area, premium amenities, and panoramic views.',
      maxOccupancy: { adults: 4, children: 2, infants: 1 },
      bedConfiguration: [{ type: 'king', count: 1 }, { type: 'queen', count: 1 }],
      size: 65,
      sizeUnit: 'sqm',
      images: [
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', caption: 'Suite Living Area', isPrimary: true, order: 0 },
      ],
      amenities: ['wifi', 'tv', 'minibar', 'safe', 'coffee_maker', 'air_conditioning', 'city_view', 'bathtub', 'work_desk'],
      pricing: {
        basePrice: 450,
        currency: 'USD',
        taxRate: 0.12,
        cleaningFee: 50,
        extraGuestFee: 35,
      },
      availability: {
        isAvailable: true,
        totalRooms: 5,
        availableRooms: 3,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  // Beachside Resort - Rooms
  const beachsideId = properties[1]._id.toString();
  rooms.push(
    {
      _id: new ObjectId(),
      propertyId: beachsideId,
      name: 'Ocean View Double',
      type: 'double',
      description: 'Beautiful room with two double beds and stunning ocean views.',
      maxOccupancy: { adults: 4, children: 2, infants: 1 },
      bedConfiguration: [{ type: 'double', count: 2 }],
      size: 40,
      sizeUnit: 'sqm',
      images: [
        { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', caption: 'Ocean View Room', isPrimary: true, order: 0 },
      ],
      amenities: ['wifi', 'tv', 'minibar', 'safe', 'coffee_maker', 'air_conditioning', 'ocean_view', 'balcony'],
      pricing: {
        basePrice: 320,
        currency: 'USD',
        taxRate: 0.10,
        cleaningFee: 40,
        extraGuestFee: 30,
      },
      availability: {
        isAvailable: true,
        totalRooms: 20,
        availableRooms: 15,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  // Downtown Apartments - Rooms
  const downtownId = properties[2]._id.toString();
  rooms.push(
    {
      _id: new ObjectId(),
      propertyId: downtownId,
      name: 'One Bedroom Apartment',
      type: 'suite',
      description: 'Fully furnished apartment with kitchen, living room, and bedroom.',
      maxOccupancy: { adults: 2, children: 1, infants: 1 },
      bedConfiguration: [{ type: 'queen', count: 1 }],
      size: 55,
      sizeUnit: 'sqm',
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', caption: 'Apartment Interior', isPrimary: true, order: 0 },
      ],
      amenities: ['wifi', 'tv', 'kitchen', 'washer_dryer', 'air_conditioning', 'work_desk', 'balcony'],
      pricing: {
        basePrice: 180,
        currency: 'USD',
        taxRate: 0.10,
        cleaningFee: 60,
        extraGuestFee: 20,
      },
      availability: {
        isAvailable: true,
        totalRooms: 15,
        availableRooms: 12,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const insertedRooms = await roomsCollection.insertMany(rooms);
  console.log(`✅ Created ${insertedRooms.insertedCount} rooms`);

  return { properties, rooms };
}

async function seedCars() {
  console.log('🚗 Seeding car rental data...');
  
  const vehiclesCollection = await getCollection('vehicles');

  const vehicles = [
    {
      _id: new ObjectId(),
      ownerId: TEST_CAR_OWNER_ID,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      category: 'midsize',
      transmission: 'automatic',
      fuelType: 'hybrid',
      seats: 5,
      doors: 4,
      luggage: 3,
      color: 'Silver',
      licensePlate: 'ABC123',
      images: [
        { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', caption: 'Toyota Camry', isPrimary: true, order: 0 },
      ],
      features: ['gps', 'bluetooth', 'backup_camera', 'cruise_control', 'usb_port'],
      location: {
        address: '100 Airport Road',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90045',
        coordinates: { lat: 33.9416, lng: -118.4085 },
        pickupInstructions: 'Pick up at Terminal 1, Rental Car Center',
      },
      pricing: {
        dailyRate: 55,
        weeklyRate: 330,
        monthlyRate: 1200,
        currency: 'USD',
        deposit: 200,
        mileageLimit: 200,
        extraMileageFee: 0.25,
        insuranceFee: 15,
      },
      status: 'available',
      averageRating: 4.8,
      reviewCount: 45,
      totalRentals: 67,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      ownerId: TEST_CAR_OWNER_ID,
      make: 'Honda',
      model: 'Civic',
      year: 2024,
      category: 'compact',
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 5,
      doors: 4,
      luggage: 2,
      color: 'Blue',
      licensePlate: 'XYZ789',
      images: [
        { url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', caption: 'Honda Civic', isPrimary: true, order: 0 },
      ],
      features: ['bluetooth', 'backup_camera', 'usb_port', 'apple_carplay'],
      location: {
        address: '200 Downtown Plaza',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        pickupInstructions: 'Pick up at main entrance',
      },
      pricing: {
        dailyRate: 45,
        weeklyRate: 270,
        monthlyRate: 950,
        currency: 'USD',
        deposit: 150,
        mileageLimit: 150,
        extraMileageFee: 0.30,
        insuranceFee: 12,
      },
      status: 'available',
      averageRating: 4.6,
      reviewCount: 32,
      totalRentals: 48,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      ownerId: TEST_CAR_OWNER_ID,
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      category: 'luxury',
      transmission: 'automatic',
      fuelType: 'electric',
      seats: 5,
      doors: 4,
      luggage: 2,
      color: 'White',
      licensePlate: 'TESLA01',
      images: [
        { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800', caption: 'Tesla Model 3', isPrimary: true, order: 0 },
      ],
      features: ['gps', 'bluetooth', 'backup_camera', 'autopilot', 'premium_audio', 'heated_seats'],
      location: {
        address: '500 Tech Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        pickupInstructions: 'Charging station parking lot',
      },
      pricing: {
        dailyRate: 120,
        weeklyRate: 720,
        monthlyRate: 2800,
        currency: 'USD',
        deposit: 500,
        mileageLimit: 250,
        extraMileageFee: 0.40,
        insuranceFee: 25,
      },
      status: 'available',
      averageRating: 4.9,
      reviewCount: 78,
      totalRentals: 92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      ownerId: TEST_CAR_OWNER_ID,
      make: 'Ford',
      model: 'Explorer',
      year: 2023,
      category: 'suv',
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 7,
      doors: 4,
      luggage: 5,
      color: 'Black',
      licensePlate: 'SUV456',
      images: [
        { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', caption: 'Ford Explorer', isPrimary: true, order: 0 },
      ],
      features: ['gps', 'bluetooth', 'backup_camera', 'third_row_seating', 'roof_rack', 'usb_port'],
      location: {
        address: '300 Beach Boulevard',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        zipCode: '33139',
        coordinates: { lat: 25.7617, lng: -80.1918 },
        pickupInstructions: 'Hotel valet parking',
      },
      pricing: {
        dailyRate: 85,
        weeklyRate: 510,
        monthlyRate: 1900,
        currency: 'USD',
        deposit: 300,
        mileageLimit: 200,
        extraMileageFee: 0.35,
        insuranceFee: 20,
      },
      status: 'available',
      averageRating: 4.7,
      reviewCount: 56,
      totalRentals: 71,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: new ObjectId(),
      ownerId: TEST_CAR_OWNER_ID,
      make: 'Chevrolet',
      model: 'Spark',
      year: 2023,
      category: 'economy',
      transmission: 'manual',
      fuelType: 'petrol',
      seats: 4,
      doors: 4,
      luggage: 1,
      color: 'Red',
      licensePlate: 'ECO123',
      images: [
        { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', caption: 'Chevrolet Spark', isPrimary: true, order: 0 },
      ],
      features: ['bluetooth', 'usb_port', 'air_conditioning'],
      location: {
        address: '100 Airport Road',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90045',
        coordinates: { lat: 33.9416, lng: -118.4085 },
        pickupInstructions: 'Economy lot, Terminal 2',
      },
      pricing: {
        dailyRate: 35,
        weeklyRate: 210,
        monthlyRate: 750,
        currency: 'USD',
        deposit: 100,
        mileageLimit: 150,
        extraMileageFee: 0.20,
        insuranceFee: 10,
      },
      status: 'available',
      averageRating: 4.3,
      reviewCount: 28,
      totalRentals: 41,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const insertedVehicles = await vehiclesCollection.insertMany(vehicles);
  console.log(`✅ Created ${insertedVehicles.insertedCount} vehicles`);

  return vehicles;
}

async function main() {
  try {
    console.log('🌱 Starting data seeding...\n');
    
    await seedHotels();
    console.log('');
    await seedCars();
    
    console.log('\n✅ Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();

