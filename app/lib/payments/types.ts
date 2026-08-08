import { PaymentGateway } from "../../../lib/prisma-client";

export interface CreateOrderParams {
  amount: number;
  currency: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  serviceName: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderResult {
  gatewayTransactionId: string;
  clientSecret?: string; // used for Stripe
  paymentUrl?: string; // used for PayU redirect
  metadata?: Record<string, any>;
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifyWebhook(payload: any, signature: string): Promise<boolean>;
}
