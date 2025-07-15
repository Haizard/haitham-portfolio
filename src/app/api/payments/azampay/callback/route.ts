

'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getJobById, updateJobEscrowStatus } from '@/lib/jobs-data';
import { updateOrderStatus } from '@/lib/orders-data'; // Import order functions
import { ObjectId } from 'mongodb';

interface AzamPayCallbackPayload {
  transactionId: string;
  msisdn: string;
  amount: string;
  utilityref: string; // Our internal reference ID (Job ID or Order IDs)
  message: string;
  submerchantname: string;
  bank: string;
}

async function handleJobPayment(jobId: string) {
  if (!ObjectId.isValid(jobId)) {
    console.error(`[AzamPay Callback] Invalid Job ID in payload: ${jobId}`);
    return false;
  }
  console.log(`[AzamPay Callback] Payment successful for Job ID: ${jobId}. Updating escrow status to 'funded'.`);
  const updatedJob = await updateJobEscrowStatus(jobId, 'funded');
  if (!updatedJob) {
    console.error(`[AzamPay Callback] Failed to update job status for Job ID: ${jobId}. Job may not exist.`);
    return false;
  }
  console.log(`[AzamPay Callback] Job ${jobId} successfully funded.`);
  return true;
}

async function handleOrderPayment(orderIds: string) {
  const ids = orderIds.split(',');
  const validIds = ids.filter(id => ObjectId.isValid(id));
  if (validIds.length === 0) {
    console.error(`[AzamPay Callback] No valid Order IDs in payload: ${orderIds}`);
    return false;
  }

  console.log(`[AzamPay Callback] Payment successful for Order IDs: ${orderIds}. Updating status to 'Pending'.`);
  const updatePromises = validIds.map(id => updateOrderStatus(id, 'Pending'));
  const results = await Promise.all(updatePromises);

  if (results.some(r => r === null)) {
    console.error(`[AzamPay Callback] Failed to update status for one or more orders in: ${orderIds}`);
    // Handle partial failure if necessary
    return false;
  }
  console.log(`[AzamPay Callback] Orders ${orderIds} successfully marked as pending.`);
  return true;
}


export async function POST(request: NextRequest) {
  try {
    const payload: AzamPayCallbackPayload = await request.json();
    console.log('[AzamPay Callback] Received payload:', JSON.stringify(payload, null, 2));

    const referenceId = payload.utilityref;
    const paymentSuccessful = payload.message.toLowerCase() === 'success';

    if (!referenceId) {
        console.error('[AzamPay Callback] Missing utilityref in payload.');
        return NextResponse.json({ message: "Missing reference ID in callback payload." }, { status: 400 });
    }

    if (paymentSuccessful) {
        // The reference could be a single Job ID or a comma-separated list of Order IDs.
        // We can differentiate based on the presence of a comma, or a more robust prefix system in a real app.
        let success = false;
        if (referenceId.includes(',')) {
           success = await handleOrderPayment(referenceId);
        } else {
           success = await handleJobPayment(referenceId);
        }
        
        if (success) {
           return NextResponse.json({ message: "Callback processed successfully.", status: "processed" });
        } else {
           return NextResponse.json({ message: `Could not process reference ID ${referenceId}.` }, { status: 404 });
        }

    } else {
        console.warn(`[AzamPay Callback] Payment was not successful for reference: ${referenceId}. Status: ${payload.message}`);
        return NextResponse.json({ message: "Payment was not successful.", status: "failed" });
    }

  } catch (error: any) {
    console.error("[AzamPay Callback] Critical error processing callback:", error);
    return NextResponse.json({ message: `Error processing callback: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
