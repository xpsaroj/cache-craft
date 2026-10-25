import type { ReactNode } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/page-container";
import { RequireAuth } from "@/lib/auth/require-auth";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="border-b border-line bg-surface">
        <PageContainer>
          <AccountNav />
        </PageContainer>
      </div>
      {children}
    </RequireAuth>
  );
}
