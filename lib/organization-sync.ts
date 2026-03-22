import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function ensureUserInDatabase(clerkUserId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (existingUser) {
    return existingUser;
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUserId}@temp.com`;
  const name =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";

  return prisma.user.create({
    data: {
      clerkUserId,
      email,
      name,
    },
  });
}

export async function syncOrganizationMembership(
  clerkUserId: string,
  clerkOrgId: string,
) {
  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({
    userId: clerkUserId,
  });

  const membership = memberships.data.find(
    (item) => item.organization.id === clerkOrgId,
  );

  if (!membership) {
    return null;
  }

  const user = await ensureUserInDatabase(clerkUserId);
  const organization = await prisma.organization.upsert({
    where: { clerkOrgId },
    update: {
      name: membership.organization.name,
      slug:
        membership.organization.slug ||
        slugifyOrganizationName(membership.organization.name),
    },
    create: {
      clerkOrgId,
      name: membership.organization.name,
      slug:
        membership.organization.slug ||
        slugifyOrganizationName(membership.organization.name),
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: {
      role: membership.role,
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: membership.role,
    },
  });

  return { organization, user, role: membership.role };
}
