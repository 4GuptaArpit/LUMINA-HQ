import { NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncOrganizationMembership } from "@/lib/organization-sync";
import { extractPdfTextFromUrl, isPdfFile } from "@/lib/pdf";

export async function POST(request: Request) {
  try {
    // 1. Check auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    // 2. Get request data
    const { documentId, organizationId, analysisType } = await request.json();
    if (!documentId || !organizationId) {
      return NextResponse.json(
        { error: "Missing document or organization ID" },
        { status: 400 },
      );
    }

    const supportedAnalysisTypes = new Set([
      "summary",
      "qa",
      "sentiment",
      "entities",
      "extract",
    ]);

    if (!supportedAnalysisTypes.has(analysisType)) {
      return NextResponse.json(
        { error: "Unsupported analysis type" },
        { status: 400 },
      );
    }

    // 3. Find document
    let document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organization: {
          OR: [{ clerkOrgId: organizationId }, { id: organizationId }],
          members: {
            some: {
              user: { clerkUserId: userId },
            },
          },
        },
      },
    });

    if (!document && typeof organizationId === "string") {
      await syncOrganizationMembership(userId, organizationId);
      document = await prisma.document.findFirst({
        where: {
          id: documentId,
          organization: {
            OR: [{ clerkOrgId: organizationId }, { id: organizationId }],
            members: {
              some: {
                user: { clerkUserId: userId },
              },
            },
          },
        },
      });
    }

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or no access" },
        { status: 404 },
      );
    }

    // 4. Get content (use name if no content)
    let content = document.content || "";

    if (!content && document.fileUrl && isPdfFile(document.fileType, document.name)) {
      content = await extractPdfTextFromUrl(document.fileUrl);

      if (content) {
        await prisma.document.update({
          where: { id: document.id },
          data: { content },
        });
      }
    }

    content = content || document.name;

    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        { error: "Document has no content to analyze" },
        { status: 400 },
      );
    }

    // 5. Run ONE analysis (summary only for simplicity)
    const summary = await analyzeWithGemini(content, analysisType);

    // 6. Save result
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        aiSummary: summary,
        aiKeywords: ["analyzed"],
        sentiment: "analyzed",
      },
    });

    // 7. Return success
    return NextResponse.json({
      success: true,
      summary,
      document: {
        id: updatedDocument.id,
        name: updatedDocument.name,
        aiSummary: updatedDocument.aiSummary,
      },
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed: " + error.message },
      { status: 500 },
    );
  }
}
