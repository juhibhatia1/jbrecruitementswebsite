import Stripe from "stripe";
import { PaymentProvider, CreateOrderParams, CreateOrderResult } from "./types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export class StripeProvider implements PaymentProvider {
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    let customerId: string | undefined = undefined;

    if (params.candidateEmail) {
      try {
        const emailClean = params.candidateEmail.trim().toLowerCase();
        const existingCustomers = await stripe.customers.list({
          email: emailClean,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          const customer = existingCustomers.data[0];
          customerId = customer.id;
          if (params.candidateName && customer.name !== params.candidateName.trim()) {
            await stripe.customers.update(customer.id, {
              name: params.candidateName.trim(),
              ...(params.candidatePhone && { phone: params.candidatePhone.trim() }),
            });
          }
        } else {
          const newCustomer = await stripe.customers.create({
            email: emailClean,
            name: params.candidateName.trim(),
            ...(params.candidatePhone && { phone: params.candidatePhone.trim() }),
          });
          customerId = newCustomer.id;
        }
      } catch (custErr) {
        console.error("Failed to create/update Stripe Customer record:", custErr);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Stripe expects amounts in cents
      currency: params.currency.toLowerCase(),
      description: params.serviceName,
      receipt_email: params.candidateEmail,
      customer: customerId,
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
