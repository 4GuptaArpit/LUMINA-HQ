import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { syncOrganizationMembership } from "@/lib/organization-sync";

interface TeamPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { orgSlug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!organization) {
    redirect("/select-org");
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
    redirect("/select-org");
  }

  const client = await clerkClient();
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: organization.clerkOrgId,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-gray-600">
          Members with access to {organization.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({memberships.totalCount})
          </CardTitle>
          <CardDescription>
            Organization access is managed through Clerk memberships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memberships.data.map((item) => {
              const publicUserData = item.publicUserData;
              const fullName =
                `${publicUserData?.firstName || ""} ${publicUserData?.lastName || ""}`.trim();
              const identifier = publicUserData?.identifier || "Unknown member";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {fullName || identifier}
                    </p>
                    <p className="text-sm text-gray-500">
                      {identifier}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {item.role}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
