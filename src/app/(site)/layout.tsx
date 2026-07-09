import { requireSession } from "@/lib/auth";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <>
      <Nav isAdmin={session.role === "admin"} />
      {children}
      <Footer isAdmin={session.role === "admin"} />
    </>
  );
}
