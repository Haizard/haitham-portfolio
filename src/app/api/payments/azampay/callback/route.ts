'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { getJobById, updateJobEscrowStatus } from '@/lib/jobs-data';
import { ObjectId } from 'mongodb';

/**
 * AzamPay Payment Callback Handler
 *
 * This API route is the designated "Callback URL" for AzamPay.
 * After a transaction, AzamPay will send a POST request to this endpoint
 * with the details of the transaction.
 *
 * NOTE: This is a simplified simulation. A real-world implementation MUST:
 * 1. Validate the incoming request to ensure it's genuinely from AzamPay (e.g., by checking a signature header).
 * 2. Handle various transaction statuses (success, failure, pending).
 * 3. Securely parse the transaction details.
 */

// This is a simplified mock of the expected callback payload from AzamPay.
// You will need to replace this with the actual structure from AzamPay's documentation.
interface AzamPayCallbackPayload {
  transactionId: string;
  msisdn: string; // Phone number
  amount: string; // The amount paid
  utilityref: string; // Our internal reference ID (we will use the Job ID here)
  message: string; // e.g., "Success"
  submerchantname: string;
  bank: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: AzamPayCallbackPayload = await request.json();
    console.log('[AzamPay Callback] Received payload:', JSON.stringify(payload, null, 2));

    // For a real integration, you would add a verification step here.
    // For example:
    // const signature = request.headers.get('X-AzamPay-Signature');
    // if (!verifyAzamPaySignature(payload, signature)) {
    //   return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
    // }
    
    const jobId = payload.utilityref;
    const paymentSuccessful = payload.message.toLowerCase() === 'success';

    if (!jobId || !ObjectId.isValid(jobId)) {
        console.error('[AzamPay Callback] Invalid or missing Job ID (utilityref) in payload:', jobId);
        return NextResponse.json({ message: "Invalid Job ID in callback payload." }, { status: 400 });
    }

    if (paymentSuccessful) {
        console.log(`[AzamPay Callback] Payment successful for Job ID: ${jobId}. Updating escrow status to 'funded'.`);
        const updatedJob = await updateJobEscrowStatus(jobId, 'funded');

        if (!updatedJob) {
            console.error(`[AzamPay Callback] Failed to update job status for Job ID: ${jobId}. Job may not exist.`);
            // A real system might flag this for manual review.
            return NextResponse.json({ message: `Job with ID ${jobId} not found.` }, { status: 404 });
        }
        
        // TODO: In a real app, you would also record this transaction in a 'transactions' collection for auditing.

        console.log(`[AzamPay Callback] Job ${jobId} successfully funded.`);
        return NextResponse.json({ message: "Callback processed successfully.", status: "funded" });

    } else {
        console.warn(`[AzamPay Callback] Payment was not successful for Job ID: ${jobId}. Status: ${payload.message}`);
        // Optionally, you could update the job status to 'funding_failed' or notify the user.
        return NextResponse.json({ message: "Payment was not successful.", status: "failed" });
    }

  } catch (error: any) {
    console.error("[AzamPay Callback] Critical error processing callback:", error);
    return NextResponse.json({ message: `Error processing callback: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
