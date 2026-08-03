"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  EMPLOYEE_SESSION_COOKIE,
  isValidEmployeeSessionToken,
} from "@/lib/employee-auth";
import { revalidatePath } from "next/cache";

export async function updatePurchaseStatus(
  purchaseId: string,
  field: "status" | "mockInterviewStatus" | "deliveryStatus",
  value: string
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EMPLOYEE_SESSION_COOKIE)?.value;
  if (!isValidEmployeeSessionToken(token)) {
    throw new Error("Unauthorized");
  }

  await prisma.purchase.update({
    where: { id: purchaseId },
    data: { [field]: value },
  });

  revalidatePath("/employee/interviews");
}
