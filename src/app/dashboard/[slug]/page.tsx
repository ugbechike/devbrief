import React from "react";
import { Dashboard } from "~/modules/dashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Dashboard slug={slug} />;
}
