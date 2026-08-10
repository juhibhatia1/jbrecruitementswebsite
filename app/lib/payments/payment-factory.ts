import { PaymentGateway } from "../../../lib/prisma-client";
import { PaymentProvider } from "./types";
import { StripeProvider } from "./stripe-provider";
import { PayUProvider } from "./payu-provider";

export class PaymentFactory {
  static getProvider(gateway: PaymentGateway | string): PaymentProvider {
    switch (gateway.toUpperCase()) {
      case "STRIPE":
      case PaymentGateway.STRIPE:
        return new StripeProvider();
      case "PAYU":
      case PaymentGateway.PAYU:
        return new PayUProvider();
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }
}
