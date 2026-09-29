export const metadata = {
  title: "Policy Processor (LAW) — Circuit-Governed Vaults",
  description: "We help vaults enforce withdrawal rules that can't be edited after deployment. TapeOut Genesis Hackathon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0, background:"#0a0a0a"}}>{children}</body>
    </html>
  );
}
