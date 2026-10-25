import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { OrganizerNav } from "@/components/organizer/organizer-nav";
import { RequireAuth } from "@/lib/auth/require-auth";

export default function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireAuth role="ORGANIZER">
      <div className="border-b border-line bg-surface">
        <PageContainer>
          <OrganizerNav />
        </PageContainer>
      </div>
      {children}
    </RequireAuth>
  );
}
