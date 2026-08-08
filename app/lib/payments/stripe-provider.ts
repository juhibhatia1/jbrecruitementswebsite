import Stripe from "stripe";
import { PaymentProvider, CreateOrderParams, CreateOrderResult } from "./types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export class StripeProvider implements PaymentProvider {
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Stripe expects amounts in cents
      currency: params.currency.toLowerCase(),
      description: params.serviceName,
      receipt_email: params.candidateEmail,
      metadata: params.metadata || {},
    });

    return {
      gatewayTransactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<boolean> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    try {
      // payload should be the raw body buffer for Stripe
      stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return true;
    } catch (err) {
      console.error("Stripe webhook verification failed.", err);
      return false;
    }
  }
}
