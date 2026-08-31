import React from "react";
import { PublicNavbar } from "./public-navbar";
import { PublicFooter } from "./public-footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
