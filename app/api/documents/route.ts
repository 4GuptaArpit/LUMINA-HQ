import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncOrganizationMembership } from "@/lib/organization-sync";
import { canExtractTextFromFile } from "@/lib/document-utils";
import { extractPdfText, extractPdfTextFromUrl, isPdfFile } from "@/lib/pdf";

async function parseDocumentCreateRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();

    return {
      name: typeof body.name === "string" ? body.name : "",
      content: typeof body.content === "string" ? body.content : "",
      organizationId:
        typeof body.organizationId === "string" ? body.organizationId : "",
      file: null as File | null,
      uploadedFileUrl:
        typeof body.fileUrl === "string" ? body.fileUrl : null,
      uploadedFileSize:
        typeof body.fileSize === "number" ? body.fileSize : null,
      uploadedFileType:
        typeof body.fileType === "string" ? body.fileType : null,
    };
  }

  const formData = await request.formData();
  const fileEntry = formData.get("file");

  return {
    name: formData.get("name") as string,
    content: formData.get("content") as string,
    organizationId: formData.get("organizationId") as string,
    file: fileEntry instanceof File ? fileEntry : null,
    uploadedFileUrl: (formData.get("fileUrl") as string | null) || null,
    uploadedFileSize: formData.get("fileSize")
      ? Number(formData.get("fileSize"))
      : null,
    uploadedFileType: (formData.get("fileType") as string | null) || null,
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      content,
      organizationId,
      file,
      uploadedFileUrl,
      uploadedFileSize,
      uploadedFileType,
    } = await parseDocumentCreateRequest(request);

    console.log("🔍 API Input:", {
      name,
      organizationId,
      file: file?.name,
      fileSize: file?.size || uploadedFileSize,
    });

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Name and organization ID are required" },
        { status: 400 },
      );
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

    console.log("🔍 Found organization:", {
      found: !!organization,
      inputOrganizationId: organizationId,
      dbId: organization?.id,
      clerkOrgId: organization?.clerkOrgId,
      name: organization?.name,
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // 2. Get user
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        memberships: {
          where: { organizationId: organization.id }, // Use DATABASE ID here
          include: {
            organization: true,
          },
        },
      },
    });

    console.log("🔍 User and memberships:", {
      userFound: !!user,
      userId: user?.id,
      email: user?.email,
      membershipsCount: user?.memberships?.length,
      membershipOrgIds: user?.memberships?.map((m) => m.organizationId),
    });

    if (!user || user.memberships.length === 0) {
      await syncOrganizationMembership(userId, organization.clerkOrgId);
      user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        include: {
          memberships: {
            where: { organizationId: organization.id },
            include: {
              organization: true,
            },
          },
        },
      });
    }

    if (!user || user.memberships.length === 0) {
      return NextResponse.json(
        {
          error: "You do not have access to this organization",
          details: `User ${userId} is not a member of ${organization.name}`,
        },
        { status: 403 },
      );
    }

    let fileUrl = uploadedFileUrl;
    let fileSize = uploadedFileSize;
    let fileType = uploadedFileType;
    let extractedContent = content;

    // Upload file to Vercel Blob if exists
    if (file && file.size > 0) {
      const blob = await uploadToBlob(file, organization.clerkOrgId, userId);
      fileUrl = blob.downloadUrl;
      fileSize = file.size;
      fileType = file.type;

      // If no content provided but we have a text file, extract text
      if (!extractedContent && canExtractTextFromFile(file.type, file.name)) {
        extractedContent = await file.text();
      }

      if (!extractedContent && isPdfFile(file.type, file.name)) {
        extractedContent = await extractPdfText(file);
      }

      console.log("✅ File uploaded:", { fileUrl, fileSize, fileType });
    } else if (fileUrl) {
      if (!extractedContent && canExtractTextFromFile(fileType, name)) {
        const response = await fetch(fileUrl);

        if (response.ok) {
          extractedContent = await response.text();
        }
      }

      if (!extractedContent && isPdfFile(fileType, name)) {
        extractedContent = await extractPdfTextFromUrl(fileUrl);
      }
    }

    // Create document - Use DATABASE IDs
    console.log("📝 Creating document with:", {
      name,
      organizationId: organization.id, // DATABASE ID
      userId: user.id, // DATABASE ID
    });

    const document = await prisma.document.create({
      data: {
        name,
        content: extractedContent || null,
        fileUrl,
        fileSize: fileSize || 0,
        fileType: fileType || "unknown",
        organizationId: organization.id, // ← DATABASE ID
        userId: user.id, // ← DATABASE ID
        aiKeywords: [],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            name: true,
            clerkOrgId: true, // Include for reference
          },
        },
      },
    });

    console.log("✅ Document created successfully:", document.id);

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        name: document.name,
        fileUrl: document.fileUrl,
        organization: document.organization.name,
        clerkOrgId: document.organization.clerkOrgId,
        uploadedBy: document.user.name,
      },
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to upload document",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Verify user has access to organization
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        memberships: {
          where: { organizationId: organization.id }, // Use DATABASE ID here
          include: {
            organization: true,
          },
        },
      },
    });

    console.log("User", user);

    if (!user || user.memberships.length === 0) {
      await syncOrganizationMembership(userId, organization.clerkOrgId);
      user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        include: {
          memberships: {
            where: { organizationId: organization.id },
            include: {
              organization: true,
            },
          },
        },
      });
    }

    if (!user || user.memberships.length === 0) {
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 },
      );
    }

    // Get documents for organization
    const documents = await prisma.document.findMany({
      where: { organizationId: organization.id }, // Use DATABASE ID
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            name: true,
            clerkOrgId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      documents,
      metadata: {
        organization: organization.name,
        clerkOrgId: organization.clerkOrgId,
        documentCount: documents.length,
      },
    });
  } catch (error: any) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get documents" },
      { status: 500 },
    );
  }
}
