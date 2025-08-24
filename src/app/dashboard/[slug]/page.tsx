import React from "react";
import { Dashboard } from "~/modules/dashboard";

export default function DashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  return <Dashboard slug={params.slug} />;
}
