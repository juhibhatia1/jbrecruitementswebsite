import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentFactory } from "../../../../lib/payments/payment-factory";
import { sendPurchaseEmails, sendInterviewInvitationEmail, sendNewApplicationAlertEmail } from "@/lib/emailService";
import { buildAppUrl } from "@/lib/app-url";

export async function POST(request: Request, { params }: { params: Promise<{ status: string }> }) {
  const { status: routeStatus } = await params; // 'success' or 'failure'
  
  try {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());

    const payuProvider = PaymentFactory.getProvider("PAYU");
    const isValid = await payuProvider.verifyWebhook(payload, payload.hash as string);

    if (!isValid) {
      console.error("PayU hash verification failed");
      return NextResponse.redirect(buildAppUrl(`/payment/failed?reason=verification_failed`), 303);
    }

    const { txnid, status, udf1, error_Message } = payload;
    const purchaseId = udf1 as string;

    if (!purchaseId) {
      console.error("Missing purchaseId in udf1");
      return NextResponse.redirect(buildAppUrl(`/payment/failed?reason=missing_purchase_id`), 303);
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!existingPurchase) {
      return NextResponse.redirect(buildAppUrl(`/payment/failed?reason=purchase_not_found`), 303);
    }

    if (existingPurchase.status === "COMPLETED") {
      return NextResponse.redirect(buildAppUrl(`/payment/success?payment_intent=${txnid}`), 303);
    }

    if (status === "success" && routeStatus === "success") {
      const created = new Date(existingPurchase.createdAt);
      let days = 5;
      if (existingPurchase.serviceName.includes("Ask Me Anything")) days = 2;
      else if (existingPurchase.serviceName.includes("Interview Prep")) days = 3;
      
      const deliveryDeadline = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);

      const purchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "COMPLETED",
          deliveryDeadline,
          gatewayTransactionId: txnid as string, // ensure latest txnid is stored
        },
      });

      // Handle funnel event and emails safely
      try {
        await prisma.funnelEvent.create({
          data: { serviceName: purchase.serviceName, eventType: "COMPLETED" },
        });
      } catch (e) {}

      try {
        await sendPurchaseEmails(purchase);
      } catch (emailErr) {
        console.error("Failed to send purchase emails in PayU webhook:", emailErr);
      }

      return NextResponse.redirect(buildAppUrl(`/payment/success?payment_intent=${txnid}`), 303);
    } else {
      // Failure
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "FAILED",
          completionNotes: `PayU Payment Failed: ${error_Message || "Unknown Error"}`,
          gatewayTransactionId: txnid as string,
        },
      });
      return NextResponse.redirect(buildAppUrl(`/payment/failed?reason=${error_Message || "declined"}`), 303);
    }
  } catch (err: any) {
    console.error("PayU Webhook error:", err);
    return NextResponse.redirect(buildAppUrl(`/payment/failed?reason=server_error`), 303);
  }
}
