import crypto from "crypto";
import { PaymentProvider, CreateOrderParams, CreateOrderResult } from "./types";
import { buildAppUrl } from "../../../lib/app-url";

export class PayUProvider implements PaymentProvider {
  private merchantKey: string;
  private merchantSalt: string;
  private payuUrl: string;

  constructor() {
    this.merchantKey = process.env.PAYU_MERCHANT_KEY || "";
    this.merchantSalt = process.env.PAYU_MERCHANT_SALT || "";
    const isProd = process.env.PAYU_ENV === "production";
    this.payuUrl = isProd ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    // Generate a unique transaction ID for PayU
    const txnid = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const amountStr = params.amount.toFixed(2);
    const productInfo = params.serviceName;
    const firstName = params.candidateName.split(" ")[0] || "User";
    const email = params.candidateEmail;
    
    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    // We will use udf1 to pass a custom ID if available so we can retrieve it in the webhook
    const udf1 = params.metadata?.purchaseId || "";
    
    const hashString = `${this.merchantKey}|${txnid}|${amountStr}|${productInfo}|${firstName}|${email}|${udf1}||||||||||${this.merchantSalt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return {
      gatewayTransactionId: txnid,
      paymentUrl: this.payuUrl,
      metadata: {
        key: this.merchantKey,
        txnid,
        amount: amountStr,
        productinfo: productInfo,
        firstname: firstName,
        email,
        phone: params.candidatePhone || "0000000000",
        udf1,
        hash,
        surl: buildAppUrl("/api/webhooks/payu/success"),
        furl: buildAppUrl("/api/webhooks/payu/failure"),
      },
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<boolean> {
    // For PayU, the webhook (or success/failure redirect) provides a hash.
    // The sequence for response hash is: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1,
      status,
      hash,
    } = payload;

    const hashString = `${this.merchantSalt}|${status}||||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    return hash === calculatedHash;
  }
}
