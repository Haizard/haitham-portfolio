import 'dotenv/config';
import { getAllProductCategories } from '@/lib/product-categories-data';
import { getCollection } from '@/lib/mongodb';

async function debugCategories() {
    console.log("Starting category debug...");

    // 1. Inspect raw data types
    const collection = await getCollection('productCategories');
    const docs = await collection.find({}).toArray();

    console.log(`Found ${docs.length} raw documents.`);

    docs.forEach(doc => {
        console.log(`Category: ${doc.name} (_id: ${doc._id}, type: ${typeof doc._id})`);
        if (doc.parentId) {
            console.log(`  parentId: ${doc.parentId} (type: ${typeof doc.parentId})`);
            // Check if parent exists
            const parent = docs.find(d => d._id.toString() === doc.parentId.toString());
            if (parent) {
                console.log(`  -> Parent Found: ${parent.name} (_id: ${parent._id})`);
                // Strict check
                if (doc.parentId === parent._id.toString()) {
                    console.log("  -> String Match: YES");
                } else if (doc.parentId.toString() === parent._id.toString()) {
                    console.log("  -> String Match: YES (after toString)");
                } else {
                    console.log("  -> String Match: NO");
                }
            } else {
                console.log(`  -> Parent NOT Found in retrieved docs!`);
            }
        }
    });

    // 2. Run the actual tree builder
    console.log("\nRunning getAllProductCategories()...");
    const tree = await getAllProductCategories();

    function printTree(nodes: any[], level = 0) {
        nodes.forEach(node => {
            console.log(`${"  ".repeat(level)}- ${node.name} (Children: ${node.children?.length || 0})`);
            if (node.children) {
                printTree(node.children, level + 1);
            }
        });
    }

    console.log("\nConstructed Tree Structure:");
    printTree(tree);
}

debugCategories().catch(console.error).finally(() => process.exit());
