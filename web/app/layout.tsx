import type { ReactNode } from 'react';
export const metadata = {
  title: 'Policy Processor (LAW) — Inspectable Policy Prototype',
  description: 'Explore Boolean policy circuits on X Layer and test a simulated daily withdrawal limit. No real funds are moved.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
