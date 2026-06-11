import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!isValidAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { mockInterviewStatus, mockInterviewDate } = await request.json();

    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        mockInterviewStatus: mockInterviewStatus || null,
        mockInterviewDate: mockInterviewDate ? new Date(mockInterviewDate) : null,
      },
    });

    return NextResponse.json(updatedPurchase);
  } catch (err: any) {
    console.error("Error updating mock interview schedule:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update schedule" },
      { status: 500 },
    );
  }
}
