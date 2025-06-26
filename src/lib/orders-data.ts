
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import type { Product } from './products-data';

const ORDERS_COLLECTION = 'orders';

export type LineItemStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export interface LineItem {
  _id: ObjectId; // Unique ID for the line item itself
  productId: string;
  productName: string;
  productImageUrl: string;
  vendorId: string;
  quantity: number;
  price: number; // Price per item at time of purchase
  status: LineItemStatus;
}

export interface Order {
  _id?: ObjectId;
  id?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  orderDate: Date;
  totalAmount: number;
  lineItems: LineItem[];
}

function docToOrder(doc: any): Order {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Order;
}

// Seed some initial data if the collection is empty
async function seedInitialOrders() {
  const ordersCollection = await getCollection<Order>(ORDERS_COLLECTION);
  const productsCollection = await getCollection<Product>('products');
  const count = await ordersCollection.countDocuments();

  if (count === 0) {
    console.log("Seeding initial orders...");
    const allProducts = await productsCollection.find({}).toArray();
    if (allProducts.length < 4) {
      console.log("Not enough products to seed orders. Please add more products.");
      return;
    }

    const mockOrders: Omit<Order, 'id' | '_id'>[] = [
      {
        customerName: "Alice Wonderland",
        customerEmail: "alice@example.com",
        shippingAddress: "123 Fantasy Lane, Wonderland",
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        totalAmount: 0, // Will be calculated
        lineItems: [
          { _id: new ObjectId(), productId: allProducts[0]._id.toString(), productName: allProducts[0].name, productImageUrl: allProducts[0].imageUrl, vendorId: allProducts[0].vendorId, quantity: 1, price: allProducts[0].price || 0, status: 'Pending' },
          { _id: new ObjectId(), productId: allProducts[1]._id.toString(), productName: allProducts[1].name, productImageUrl: allProducts[1].imageUrl, vendorId: allProducts[1].vendorId, quantity: 1, price: allProducts[1].price || 0, status: 'Pending' },
        ],
      },
      {
        customerName: "Bob The Builder",
        customerEmail: "bob@example.com",
        shippingAddress: "456 Construction Way, Builderville",
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        totalAmount: 0, // Will be calculated
        lineItems: [
          { _id: new ObjectId(), productId: allProducts[2]._id.toString(), productName: allProducts[2].name, productImageUrl: allProducts[2].imageUrl, vendorId: allProducts[2].vendorId, quantity: 2, price: allProducts[2].price || 0, status: 'Shipped' },
        ],
      },
       {
        customerName: "Charlie Creator",
        customerEmail: "charlie@example.com",
        shippingAddress: "789 Art Avenue, Creativity City",
        orderDate: new Date(), // Today
        totalAmount: 0, // Will be calculated
        lineItems: [
          { _id: new ObjectId(), productId: allProducts[0]._id.toString(), productName: allProducts[0].name, productImageUrl: allProducts[0].imageUrl, vendorId: allProducts[0].vendorId, quantity: 1, price: allProducts[0].price || 0, status: 'Processing' },
          { _id: new ObjectId(), productId: allProducts[3]._id.toString(), productName: allProducts[3].name, productImageUrl: allProducts[3].imageUrl, vendorId: allProducts[3].vendorId, quantity: 1, price: allProducts[3].price || 0, status: 'Pending' },
        ],
      }
    ];

    // Calculate total amount for each order
    mockOrders.forEach(order => {
      order.totalAmount = order.lineItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    });

    await ordersCollection.insertMany(mockOrders as any[]);
    console.log("Initial orders seeded.");
  }
}

seedInitialOrders().catch(console.error);


export async function getOrdersByVendorId(vendorId: string): Promise<Order[]> {
  const collection = await getCollection<Order>(ORDERS_COLLECTION);
  
  // Find orders where at least one line item belongs to the vendor
  const vendorOrdersCursor = collection.find({
    "lineItems.vendorId": vendorId
  }).sort({ orderDate: -1 });
  
  const allVendorOrders = await vendorOrdersCursor.toArray();

  // For each order, filter the lineItems to only show the ones belonging to the vendor
  const filteredOrders = allVendorOrders.map(order => {
    const vendorLineItems = order.lineItems.filter(item => item.vendorId === vendorId);
    return {
      ...order,
      lineItems: vendorLineItems,
      // Optional: recalculate total based on only their items if needed, but showing order total is fine
    };
  });

  return filteredOrders.map(docToOrder);
}

export async function updateLineItemStatus(orderId: string, lineItemId: string, newStatus: LineItemStatus): Promise<boolean> {
  if (!ObjectId.isValid(orderId) || !ObjectId.isValid(lineItemId)) {
    return false;
  }
  const collection = await getCollection<Order>(ORDERS_COLLECTION);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(orderId), "lineItems._id": new ObjectId(lineItemId) },
    { $set: { "lineItems.$.status": newStatus } }
  );

  return result.modifiedCount === 1;
}
