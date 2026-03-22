import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncOrganizationMembership } from "@/lib/organization-sync";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clerkOrgId, name, slug } = body;

    if (!clerkOrgId || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const synced = await syncOrganizationMembership(userId, clerkOrgId);

    if (!synced) {
      return NextResponse.json(
        { error: "You do not belong to this organization in Clerk" },
        { status: 403 },
      );
    }

    const organization = synced.organization;

    return NextResponse.json({
      success: true,
      organization,
      message: `Organization "${name || organization.name}" synced successfully`,
    });
  } catch (error: any) {
    console.error("[ORGANIZATIONS_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create organization" },
      { status: 500 },
    );
  }
}
