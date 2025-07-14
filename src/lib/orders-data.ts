

import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { getProductById, type Product } from './products-data'; // Import Product type
import { getFreelancerProfile } from './user-profile-data'; // To enrich with vendor names
import { getPlatformSettings } from './settings-data'; // Import settings to get commission rate
import { createDelivery } from './deliveries-data';

const ORDERS_COLLECTION = 'orders';

export type LineItemStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
export type OrderType = 'delivery' | 'pickup';

// LineItem no longer needs vendorId, as the parent Order will have it.
export interface LineItem {
  _id: ObjectId; // Unique ID for the line item itself
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number; // Price per item at time of purchase
  status: LineItemStatus;
  commissionRate: number;
  commissionAmount: number;
  vendorEarnings: number;
  description?: string; // For selected customizations
}

// Order now has a vendorId
export interface Order {
  _id?: ObjectId;
  id?: string;
  vendorId: string; // The vendor this specific order belongs to
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  orderDate: Date;
  status: OrderStatus; // Add status to the main order
  orderType: OrderType;
  fulfillmentTime: Date;
  totalAmount: number; // The total for this specific vendor's portion of the order
  lineItems: LineItem[];
  deliveryId?: string | null; // ID of the associated delivery task
  // Enriched field for admin views
  vendorName?: string;
}

// Interface for dashboard stats API
export interface AdminDashboardStats {
    totalSales: number;
    totalOrders: number;
    monthlySales: { name: string; sales: number; orders: number; }[];
    recentOrders: Order[];
    // topSellingProducts will be added in the API route from the products data lib
}

export interface RestaurantAnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    monthlySales: { name: string; sales: number; orders: number }[];
    topSellingItems: {
        _id: string;
        productName: string;
        totalQuantity: number;
        totalRevenue: number;
    }[];
}

function docToOrder(doc: any): Order {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Order;
}

// The core order splitting logic.
export async function createOrderFromCart(
    customerDetails: { name: string; email: string; address: string }, 
    cart: { productId: string; quantity: number, description?: string }[],
    orderType: OrderType,
    fulfillmentTime: Date
): Promise<Order[]> {
    const ordersCollection = await getCollection<Order>(ORDERS_COLLECTION);
    const createdOrders: Order[] = [];

    const { commissionRate } = await getPlatformSettings();

    // 1. Fetch all product details to get price, vendor, etc.
    const productIds = cart.map(item => item.productId.split('-')[0]); // Handle potentially customized IDs
    const productPromises = productIds.map(id => getProductById(id));
    const products = (await Promise.all(productPromises)).filter((p): p is Product => p !== null);
    
    const productsById = new Map(products.map(p => [p.id!, p]));

    // 2. Group cart items by vendorId
    const itemsByVendor = new Map<string, typeof cart>();
    for (const item of cart) {
        const product = productsById.get(item.productId.split('-')[0]);
        // This is the key check: it works for both creator products and restaurant items.
        if (product && (product.productType === 'creator' || product.productType === 'restaurant-item')) {
            if (!itemsByVendor.has(product.vendorId)) {
                itemsByVendor.set(product.vendorId, []);
            }
            itemsByVendor.get(product.vendorId)!.push(item);
        }
    }
    
    // 3. Create a separate order for each vendor
    for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
        const now = new Date();
        let totalAmount = 0;

        const lineItems: LineItem[] = vendorItems.map(item => {
            const product = productsById.get(item.productId.split('-')[0])!;
            const itemTotal = (product.price || 0) * item.quantity;
            totalAmount += itemTotal;
            const commissionAmount = itemTotal * commissionRate;

            return {
                _id: new ObjectId(),
                productId: product.id!,
                productName: product.name,
                productImageUrl: product.imageUrl,
                quantity: item.quantity,
                price: product.price || 0,
                status: 'Pending',
                commissionRate: commissionRate,
                vendorEarnings: itemTotal - commissionAmount,
                description: item.description, // Pass customizations
            };
        });

        const newOrderDoc: Omit<Order, 'id' | '_id'> = {
            vendorId,
            customerName: customerDetails.name,
            customerEmail: customerDetails.email,
            shippingAddress: customerDetails.address,
            orderDate: now,
            status: 'Pending', // Initial order status
            orderType,
            fulfillmentTime,
            totalAmount,
            lineItems,
        };
        
        const result = await ordersCollection.insertOne(newOrderDoc as any);
        const createdOrder = docToOrder({ _id: result.insertedId, ...newOrderDoc });
        
        // If it's a delivery order, create a delivery task for it
        if(orderType === 'delivery') {
            const delivery = await createDelivery({
                orderId: createdOrder.id!,
                vendorId: vendorId,
                customerName: customerDetails.name,
                deliveryAddress: customerDetails.address,
            });
            // Link the delivery to the order
            await ordersCollection.updateOne({ _id: createdOrder._id }, { $set: { deliveryId: delivery.id } });
            createdOrder.deliveryId = delivery.id;
        }

        createdOrders.push(createdOrder);
    }
    
    console.log(`Split cart into ${createdOrders.length} orders.`);
    return createdOrders;
}


// Seed data function now uses the new order splitting logic
async function seedInitialOrders() {
  const ordersCollection = await getCollection<Order>(ORDERS_COLLECTION);
  const productsCollection = await getCollection<Product>('products');
  const count = await ordersCollection.countDocuments();

  if (count === 0) {
    console.log("Seeding initial orders using createOrderFromCart logic...");
    const vendorProducts = await productsCollection.find({ productType: 'creator' }).limit(4).toArray();
    
    if (vendorProducts.length < 2) {
      console.log("Not enough creator products from different vendors to seed split orders.");
      return;
    }

    // Create a mock cart with items from potentially different vendors
    const mockCart = [
        { productId: vendorProducts[0]._id.toString(), quantity: 1 },
        { productId: vendorProducts[1]._id.toString(), quantity: 2 },
    ];
    
    if (vendorProducts.length > 2) {
      // Add another item from the first vendor to test grouping
      mockCart.push({ productId: vendorProducts[0]._id.toString(), quantity: 1 });
    }

    const customerDetails = {
      name: "Alice Wonderland",
      email: "alice@example.com",
      address: "123 Fantasy Lane, Wonderland",
    };
    
    await createOrderFromCart(customerDetails, mockCart, 'delivery', new Date());
    console.log("Initial orders seeded.");
  }
}

seedInitialOrders().catch(console.error);

// The getOrdersByVendorId function is now much simpler.
export async function getOrdersByVendorId(vendorId: string): Promise<Order[]> {
  const collection = await getCollection<Order>(ORDERS_COLLECTION);
  
  // No need to filter line items in code, just query for orders belonging to the vendor.
  const vendorOrders = await collection.find({ vendorId }).sort({ orderDate: -1 }).toArray();

  return vendorOrders.map(docToOrder);
}

// NEW function to get all orders for the admin panel
export async function getAllOrders(): Promise<Order[]> {
  const collection = await getCollection<Order>(ORDERS_COLLECTION);
  const allOrders = await collection.find({}).sort({ orderDate: -1 }).toArray();
  return allOrders.map(docToOrder);
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

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order | null> {
    if (!ObjectId.isValid(orderId)) {
        return null;
    }
    const collection = await getCollection<Order>(ORDERS_COLLECTION);
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: { status: newStatus } },
        { returnDocument: 'after' }
    );
    return result ? docToOrder(result) : null;
}

// --- NEW Admin Dashboard Functions ---

export async function getAdminDashboardStats(): Promise<Omit<AdminDashboardStats, 'topSellingProducts'>> {
    const ordersCollection = await getCollection<Order>(ORDERS_COLLECTION);
    
    // 1. Total Sales and Order Count
    const salesStats = await ordersCollection.aggregate([
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
    ]).toArray();
    const totalSales = salesStats[0]?.totalSales || 0;
    const totalOrders = salesStats[0]?.totalOrders || 0;

    // 2. Monthly Sales Data (for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySalesData = await ordersCollection.aggregate([
        { $match: { orderDate: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: "$orderDate" }, month: { $month: "$orderDate" } },
                sales: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray();
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySales = monthlySalesData.map(d => ({
        name: `${monthNames[d._id.month - 1]} ${d._id.year}`,
        sales: d.sales,
        orders: d.orders,
    }));
    
    // 3. Recent Orders
    const recentOrderDocs = await ordersCollection.find().sort({ orderDate: -1 }).limit(5).toArray();
    // Enrich with vendor names
    const vendorIds = [...new Set(recentOrderDocs.map(o => o.vendorId))].filter((id): id is string => !!id);
    const vendorProfiles = await Promise.all(vendorIds.map(id => getFreelancerProfile(id)));
    const vendorMap = new Map(vendorProfiles.map(p => p ? [p.userId, p.name] : [null, null]));

    const recentOrders = recentOrderDocs.map(docToOrder).map(order => ({
        ...order,
        vendorName: vendorMap.get(order.vendorId) || 'Unknown Vendor'
    }));


    return {
        totalSales,
        totalOrders,
        monthlySales,
        recentOrders
    };
}

// --- NEW Restaurant Analytics Function ---

export async function getRestaurantAnalytics(restaurantId: string): Promise<RestaurantAnalyticsData> {
    const ordersCollection = await getCollection<Order>(ORDERS_COLLECTION);
    
    const completedOrdersFilter = { vendorId: restaurantId, status: 'Completed' };

    // 1. Total Revenue, Orders, and Average Value
    const summaryStats = await ordersCollection.aggregate([
        { $match: completedOrdersFilter },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
    ]).toArray();

    const totalRevenue = summaryStats[0]?.totalRevenue || 0;
    const totalOrders = summaryStats[0]?.totalOrders || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Monthly Sales Data for the chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySalesData = await ordersCollection.aggregate([
        { $match: { vendorId: restaurantId, status: 'Completed', orderDate: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: "$orderDate" }, month: { $month: "$orderDate" } },
                sales: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray();
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySales = monthlySalesData.map(d => ({
        name: `${monthNames[d._id.month - 1]}`,
        sales: d.sales,
        orders: d.orders,
    }));
    
    // 3. Top Selling Menu Items
    const topItemsData = await ordersCollection.aggregate([
        { $match: completedOrdersFilter },
        { $unwind: "$lineItems" },
        { 
            $group: { 
                _id: "$lineItems.productId", 
                productName: { $first: "$lineItems.productName" },
                totalQuantity: { $sum: "$lineItems.quantity" },
                totalRevenue: { $sum: { $multiply: ["$lineItems.price", "$lineItems.quantity"] } }
            } 
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
    ]).toArray();

    return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        monthlySales,
        topSellingItems: topItemsData,
    };
}
