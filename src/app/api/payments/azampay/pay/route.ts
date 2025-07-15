// src/app/api/payments/azampay/pay/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { addJob, getJobById } from '@/lib/jobs-data';
import { initiateMnoCheckout } from '@/lib/azampay';
import { z } from 'zod';
import { getSession } from '@/lib/session';

const payRequestSchema = z.object({
  jobId: z.string(),
  phoneNumber: z.string().regex(/^[0-9]{9,12}$/, "Invalid phone number format."),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user?.id) {
        return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const validation = payRequestSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ message: "Invalid payment data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { jobId, phoneNumber } = validation.data;

    const job = await getJobById(jobId);
    if (!job || !job.budgetAmount) {
        return NextResponse.json({ message: "Job not found or has no budget." }, { status: 404 });
    }
    
    // Authorization check
    if (job.clientId !== session.user.id) {
        return NextResponse.json({ message: "You are not authorized to fund this job." }, { status: 403 });
    }

    // Initiate payment with AzamPay
    const paymentResponse = await initiateMnoCheckout(
        job.budgetAmount,
        phoneNumber,
        job.id!,
        'Mpesa' // This could be made dynamic in the future
    );

    if (paymentResponse.success) {
        return NextResponse.json({ 
            message: paymentResponse.message, 
            transactionId: paymentResponse.transactionId 
        });
    } else {
        return NextResponse.json({ message: paymentResponse.message || "Payment initiation failed." }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[API /api/payments/azampay/pay POST] Error:', error);
    return NextResponse.json({ message: `Payment processing error: ${error.message || "Unknown server error."}` }, { status: 500 });
  }
}
