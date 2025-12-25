
import 'dotenv/config';
import { getCollection } from '@/lib/mongodb';
import { searchVehicles } from '@/lib/cars-data';

async function debugVehicles() {
    console.log("Starting vehicle debug...");

    const collection = await getCollection('vehicles');
    const allVehicles = await collection.find({}).toArray();

    console.log(`Found ${allVehicles.length} total vehicles in DB.`);

    allVehicles.forEach(v => {
        console.log(`\nVehicle ID: ${v._id}`);
        console.log(`  Make/Model: ${v.make} ${v.model}`);
        console.log(`  Status: '${v.status}' (Type: ${typeof v.status})`);
        console.log(`  Location: City='${v.location?.city}', Country='${v.location?.country}'`);
        console.log(`  Pricing: Daily=${v.pricing?.dailyRate}`);
    });

    console.log("\n--- Testing Search Logic ---");

    // Test 1: Search with no filters (should default to status='available')
    console.log("Test 1: Empty filters (Defaults to available)");
    const results1 = await searchVehicles({});
    console.log(`  Result count: ${results1.length}`);

    // Test 2: Search with specific status
    console.log("Test 2: Explicit status='available'");
    const results2 = await searchVehicles({ status: 'available' });
    console.log(`  Result count: ${results2.length}`);

    // Test 3: Search with wide price range
    console.log("Test 3: Price range 0-10000");
    const results3 = await searchVehicles({ minPrice: 0, maxPrice: 10000 });
    console.log(`  Result count: ${results3.length}`);
}

debugVehicles().catch(console.error).finally(() => process.exit());
