
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debug() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;

    console.log('URI:', uri ? 'Set' : 'Not Set');
    console.log('DB Name:', dbName);

    if (!uri || !dbName) {
        console.error('Missing environment variables');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        const collection = db.collection('vehicles');
        const rentalsCollection = db.collection('car_rentals');

        const count = await collection.countDocuments();
        console.log('Total vehicles:', count);

        const vehicles = await collection.find({}).toArray();
        console.log('All vehicles in DB:');
        vehicles.forEach(v => {
            console.log(`- ${v.make} ${v.model} (ID: ${v._id}, Status: ${v.status}, City: ${v.location?.city})`);
        });

        // Simulate searchVehicles logic with dates
        console.log('\n--- Simulating searchVehicles with Date Filters ---');
        const pickupDate = '2025-12-25';
        const returnDate = '2025-12-26';

        console.log(`Searching for available vehicles between ${pickupDate} and ${returnDate}`);

        const availableCount = await collection.countDocuments({ status: 'available' });
        console.log('Vehicles with status="available":', availableCount);

        const availableVehicles = [];
        const availableDocs = await collection.find({ status: 'available' }).toArray();

        for (const v of availableDocs) {
            const vId = v._id.toString();
            const overlaps = await rentalsCollection.find({
                vehicleId: vId,
                status: { $in: ['pending', 'confirmed', 'active'] },
                $or: [
                    {
                        pickupDate: { $lt: returnDate },
                        returnDate: { $gt: pickupDate }
                    }
                ]
            }).toArray();

            if (overlaps.length === 0) {
                availableVehicles.push(v);
                console.log(`  [OK] Vehicle ${v.make} ${v.model} has no overlapping rentals.`);
            } else {
                console.log(`  [BLOCKED] Vehicle ${v.make} ${v.model} is BLOCKED by ${overlaps.length} rentals.`);
            }
        }
        console.log(`\nFinal simulated search result count: ${availableVehicles.length}`);

        const distinctStatuses = await collection.distinct('status');
        console.log('\nDistinct statuses in collection:', distinctStatuses);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

debug();
