
// src/lib/azampay.ts
import axios from 'axios';

const AZAMPAY_API_URL = process.env.AZAMPAY_API_URL;
const AZAMPAY_APP_NAME = process.env.AZAMPAY_APP_NAME;
const AZAMPAY_CLIENT_ID = process.env.AZAMPAY_CLIENT_ID;
const AZAMPAY_CLIENT_SECRET = process.env.AZAMPAY_CLIENT_SECRET;

interface AuthResponse {
  data: {
    accessToken: string;
    expiresIn: string;
  };
  message: string;
  success: boolean;
}

interface MnoCheckoutResponse {
  // Define the structure based on AzamPay's response
  success: boolean;
  transactionId?: string;
  message?: string;
}


// Function to get an authentication token from AzamPay
export async function getAuthToken(): Promise<string> {
    if (!AZAMPAY_API_URL || !AZAMPAY_APP_NAME || !AZAMPAY_CLIENT_ID || !AZAMPAY_CLIENT_SECRET) {
        throw new Error("AzamPay environment variables are not fully configured.");
    }
  
    try {
        // The payload should be a simple JSON object.
        const payload = {
          appName: AZAMPAY_APP_NAME,
          clientId: AZAMPAY_CLIENT_ID,
          clientSecret: AZAMPAY_CLIENT_SECRET
        };

        const response = await axios.post<AuthResponse>(
            `${AZAMPAY_API_URL}/AppRegistration/GenerateToken`, 
            payload, // Axios will automatically stringify this and set the correct JSON header
            {
                headers: {
                    // Explicitly set the Content-Type to application/json as per docs.
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.data.accessToken) {
            console.log("Successfully obtained AzamPay Auth Token.");
            return response.data.data.accessToken;
        } else {
            console.error("AzamPay token generation failed:", response.data);
            throw new Error(response.data.message || 'Failed to get AzamPay token');
        }
    } catch (error: any) {
        console.error("Error fetching AzamPay token:", error.response?.data || error.message);
        throw new Error("Could not authenticate with AzamPay.");
    }
}


// Function to initiate a Mobile Network Operator (MNO) checkout
export async function initiateMnoCheckout(
    amount: number, 
    phoneNumber: string, 
    referenceId: string, 
    provider: 'Mpesa' | 'Tigo' | 'Airtel' | 'Halopesa' // Example providers
): Promise<MnoCheckoutResponse> {
    const token = await getAuthToken();

    try {
        const payload = {
            accountNumber: phoneNumber,
            amount: amount.toString(),
            currency: "TZS", // Assuming Tanzanian Shillings
            externalId: referenceId,
            provider: provider,
        };

        const response = await axios.post<MnoCheckoutResponse>(
            `${AZAMPAY_API_URL}/azampay/mno/checkout`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("AzamPay MNO Checkout Response:", response.data);

        if (response.data.success) {
            return {
                success: true,
                transactionId: response.data.transactionId,
                message: response.data.message || "Payment initiated successfully. Please check your phone to approve."
            };
        } else {
             return {
                success: false,
                message: response.data.message || "Payment initiation failed at AzamPay."
            };
        }
    } catch (error: any) {
        console.error("Error initiating AzamPay MNO checkout:", error.response?.data || error.message);
        throw new Error("Failed to communicate with AzamPay for checkout.");
    }
}
