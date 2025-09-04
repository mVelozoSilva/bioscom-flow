import React from 'react';
import { BioscomNavbar } from './navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <BioscomNavbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}