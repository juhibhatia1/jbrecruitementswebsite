import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { isValidEmployeeSessionToken, isValidEmployeeSessionToken as isEmployee } from "@/lib/employee-auth";
import { isValidAdminSessionToken as isAdmin, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { EMPLOYEE_SESSION_COOKIE } from "@/lib/employee-auth";

/**
 * Update delivery status of a purchase.
 * PUT /api/employee/purchases/[id]/delivery
 * Accepts { deliveryStatus: "PENDING" | "COMPLETED" }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    
    // Auth: must be either authenticated employee or authenticated admin
    const employeeToken = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
    const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    
    const isAuth = isValidEmployeeSessionToken(employeeToken) || isAdmin(adminToken);
    
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { deliveryStatus, completionNotes } = await request.json();

    if (deliveryStatus !== "PENDING" && deliveryStatus !== "COMPLETED") {
      return NextResponse.json({ error: "Invalid delivery status." }, { status: 400 });
    }

    // Resolve service name and calculate delivery deadline if marking as completed or resetting
    const purchase = await prisma.purchase.findUnique({ where: { id } });
    if (!purchase) {
      return NextResponse.json({ error: "Purchase record not found." }, { status: 404 });
    }

    // Dynamically calculate delivery deadline on the database record if not already set
    let deliveryDeadline = purchase.deliveryDeadline;
    if (!deliveryDeadline) {
      const created = new Date(purchase.createdAt);
      const service = purchase.serviceName;
      let days = 5; // default 5 days
      if (service.includes("Ask Me Anything")) {
        days = 2; // 48 hours
      } else if (service.includes("Interview Prep")) {
        days = 3; // 3 days
      }
      deliveryDeadline = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        deliveryStatus,
        deliveryDeadline,
        completionNotes: completionNotes !== undefined ? completionNotes : undefined,
      },
    });

    return NextResponse.json(updatedPurchase);
  } catch (err: any) {
    console.error("Error updating delivery status:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
