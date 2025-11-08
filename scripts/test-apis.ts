/**
 * API Testing Script
 * 
 * Tests all hotel and car rental API endpoints
 * 
 * Run with: npx tsx scripts/test-apis.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        name,
        passed: false,
        error: `HTTP ${response.status}: ${data.error || 'Unknown error'}`,
        duration,
      };
    }

    return {
      name,
      passed: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    };
  }
}

async function testHotelAPIs() {
  console.log('\n🏨 Testing Hotel APIs...\n');

  // Test 1: Search properties
  results.push(
    await testEndpoint(
      'Search properties (all)',
      'GET',
      '/api/hotels/properties'
    )
  );

  // Test 2: Search properties by city
  results.push(
    await testEndpoint(
      'Search properties (by city)',
      'GET',
      '/api/hotels/properties?city=New York'
    )
  );

  // Test 3: Search properties with filters
  results.push(
    await testEndpoint(
      'Search properties (with filters)',
      'GET',
      '/api/hotels/properties?city=Miami&type=resort&minPrice=200&maxPrice=500&amenities=pool,spa'
    )
  );

  // Test 4: Search properties with dates
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 10);

  results.push(
    await testEndpoint(
      'Search properties (with dates)',
      'GET',
      `/api/hotels/properties?city=Los Angeles&checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}`
    )
  );

  // Test 5: Get rooms for a property (you'll need to replace with actual property ID)
  // This will fail if no properties exist
  results.push(
    await testEndpoint(
      'Get rooms for property',
      'GET',
      '/api/hotels/rooms?propertyId=test-property-id'
    )
  );

  // Test 6: Check room availability
  results.push(
    await testEndpoint(
      'Check room availability',
      'GET',
      `/api/hotels/rooms/test-room-id/availability?checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}&adults=2&children=0`
    )
  );
}

async function testCarAPIs() {
  console.log('\n🚗 Testing Car Rental APIs...\n');

  // Test 1: Search vehicles (all)
  results.push(
    await testEndpoint(
      'Search vehicles (all)',
      'GET',
      '/api/cars/vehicles'
    )
  );

  // Test 2: Search vehicles by city
  results.push(
    await testEndpoint(
      'Search vehicles (by city)',
      'GET',
      '/api/cars/vehicles?city=Los Angeles'
    )
  );

  // Test 3: Search vehicles with filters
  results.push(
    await testEndpoint(
      'Search vehicles (with filters)',
      'GET',
      '/api/cars/vehicles?city=Miami&category=suv&transmission=automatic&fuelType=petrol&minPrice=50&maxPrice=150'
    )
  );

  // Test 4: Search vehicles with dates
  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 7);
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 10);

  results.push(
    await testEndpoint(
      'Search vehicles (with dates)',
      'GET',
      `/api/cars/vehicles?city=Los Angeles&pickupDate=${pickupDate.toISOString().split('T')[0]}&returnDate=${returnDate.toISOString().split('T')[0]}`
    )
  );

  // Test 5: Search vehicles by features
  results.push(
    await testEndpoint(
      'Search vehicles (by features)',
      'GET',
      '/api/cars/vehicles?features=gps,bluetooth,backup_camera'
    )
  );

  // Test 6: Check vehicle availability
  results.push(
    await testEndpoint(
      'Check vehicle availability',
      'GET',
      `/api/cars/vehicles/test-vehicle-id/availability?pickupDate=${pickupDate.toISOString().split('T')[0]}&returnDate=${returnDate.toISOString().split('T')[0]}`
    )
  );

  // Test 7: Search by category
  const categories = ['economy', 'compact', 'midsize', 'suv', 'luxury'];
  for (const category of categories) {
    results.push(
      await testEndpoint(
        `Search vehicles (category: ${category})`,
        'GET',
        `/api/cars/vehicles?category=${category}`
      )
    );
  }
}

async function testAuthAPIs() {
  console.log('\n🔐 Testing Auth APIs...\n');

  // Test 1: Login endpoint exists
  results.push(
    await testEndpoint(
      'Login endpoint (without credentials)',
      'POST',
      '/api/auth/login',
      { email: '', password: '' }
    )
  );

  // Test 2: Signup endpoint exists
  results.push(
    await testEndpoint(
      'Signup endpoint (without data)',
      'POST',
      '/api/auth/signup',
      { email: '', password: '', name: '' }
    )
  );
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log(`✅ Passed: ${passed.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Total: ${results.length}`);
  console.log(`⏱️  Average Duration: ${(results.reduce((sum, r) => sum + r.duration, 0) / results.length).toFixed(2)}ms\n`);

  if (failed.length > 0) {
    console.log('Failed Tests:');
    console.log('-'.repeat(80));
    failed.forEach((result) => {
      console.log(`❌ ${result.name}`);
      console.log(`   Error: ${result.error}`);
      console.log(`   Duration: ${result.duration}ms\n`);
    });
  }

  if (passed.length > 0) {
    console.log('Passed Tests:');
    console.log('-'.repeat(80));
    passed.forEach((result) => {
      console.log(`✅ ${result.name} (${result.duration}ms)`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

async function main() {
  console.log('🧪 Starting API Tests...');
  console.log(`Base URL: ${BASE_URL}`);

  try {
    await testHotelAPIs();
    await testCarAPIs();
    await testAuthAPIs();

    printResults();

    const failedCount = results.filter((r) => !r.passed).length;
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

main();

