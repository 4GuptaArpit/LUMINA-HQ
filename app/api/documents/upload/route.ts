import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { buildBlobPathname } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { syncOrganizationMembership } from "@/lib/organization-sync";

type UploadPayload = {
  fileName?: string;
  organizationId?: string;
};

function parseUploadPayload(clientPayload: string | null): UploadPayload {
  if (!clientPayload) {
    return {};
  }

  try {
    return JSON.parse(clientPayload) as UploadPayload;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const { fileName, organizationId } = parseUploadPayload(clientPayload);

        if (!fileName || !organizationId) {
          throw new Error("Missing upload details");
        }

        let organization = await prisma.organization.findFirst({
          where: {
            OR: [{ clerkOrgId: organizationId }, { id: organizationId }],
          },
        });

        if (!organization && organizationId.startsWith("org_")) {
          const synced = await syncOrganizationMembership(userId, organizationId);
          organization = synced?.organization || null;
        }

        if (!organization) {
          throw new Error("Organization not found");
        }

        let membership = await prisma.organizationMember.findFirst({
          where: {
            organizationId: organization.id,
            user: { clerkUserId: userId },
          },
        });

        if (!membership) {
          await syncOrganizationMembership(userId, organization.clerkOrgId);
          membership = await prisma.organizationMember.findFirst({
            where: {
              organizationId: organization.id,
              user: { clerkUserId: userId },
            },
          });
        }

        if (!membership) {
          throw new Error("You do not have access to this organization");
        }

        return {
          allowedContentTypes: [
            "text/plain",
            "text/markdown",
            "text/x-markdown",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
          allowOverwrite: false,
          maximumSizeInBytes: 10 * 1024 * 1024,
          validUntil: Date.now() + 60 * 60 * 1000,
          tokenPayload: JSON.stringify({
            organizationId: organization.id,
            organizationClerkId: organization.clerkOrgId,
            userId,
            pathname: buildBlobPathname(fileName, organization.clerkOrgId, userId),
          }),
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare upload";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
