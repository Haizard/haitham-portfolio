
// src/lib/azampay.ts
import axios from 'axios';
import fetch from 'node-fetch';

const AZAMPAY_API_URL = process.env.AZAMPAY_API_URL;
const AZAMPAY_APP_NAME = process.env.AZAMPAY_APP_NAME;
const AZAMPAY_CLIENT_ID = process.env.AZAMPAY_CLIENT_ID;
const AZAMPAY_CLIENT_SECRET = process.env.AZAMPAY_CLIENT_SECRET;

interface AuthResponseData {
  accessToken: string;
  expiresIn: string;
}
interface AuthResponse {
  data: AuthResponseData;
  message: string;
  success: boolean;
}

interface MnoCheckoutResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
}

// Function to get an authentication token from AzamPay
export async function getAuthToken(): Promise<string> {
  if (!AZAMPAY_API_URL || !AZAMPAY_APP_NAME || !AZAMPAY_CLIENT_ID || !AZAMPAY_CLIENT_SECRET) {
    console.error("Missing AzamPay variables:", {
        url: !!AZAMPAY_API_URL,
        app: !!AZAMPAY_APP_NAME,
        id: !!AZAMPAY_CLIENT_ID,
        secret: !!AZAMPAY_CLIENT_SECRET
    });
    throw new Error("AzamPay environment variables are not fully configured.");
  }
  
  try {
      const payload = {
        appName: AZAMPAY_APP_NAME,
        clientId: AZAMPAY_CLIENT_ID,
        clientSecret: AZAMPAY_CLIENT_SECRET
      };

      const response = await fetch(
        `${AZAMPAY_API_URL}/AppRegistration/GenerateToken`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      
      const responseData: AuthResponse = await response.json();

      if (response.ok && responseData.data && responseData.data.accessToken) {
          console.log("Successfully obtained AzamPay Auth Token.");
          return responseData.data.accessToken;
      } else {
          console.error("AzamPay token generation failed:", responseData);
          throw new Error(responseData.message || 'Failed to get AzamPay token');
      }
  } catch (error: any) {
      console.error("Error fetching AzamPay token:", error.message);
      throw new Error("Could not authenticate with AzamPay.");
  }
}

// Function to initiate a Mobile Network Operator (MNO) checkout
export async function initiateMnoCheckout(
    amount: number, 
    phoneNumber: string, 
    referenceId: string, 
    provider: 'Mpesa' | 'Tigo' | 'Airtel' | 'Halopesa'
): Promise<MnoCheckoutResponse> {
    const token = await getAuthToken();

    if (!AZAMPAY_CLIENT_ID) {
        throw new Error("AzamPay Client ID is missing for X-API-Key header.");
    }

    try {
        const payload = {
            accountNumber: phoneNumber,
            amount: amount.toString(),
            currency: "TZS",
            externalId: referenceId,
            provider: provider,
        };

        const response = await axios.post<MnoCheckoutResponse>(
            `${AZAMPAY_API_URL}/azampay/mno/checkout`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-API-Key': AZAMPAY_CLIENT_ID,
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
