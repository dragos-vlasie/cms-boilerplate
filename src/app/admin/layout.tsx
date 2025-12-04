import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <div className="mb-4 text-lg font-bold">CMS Admin</div>
        <nav className="flex flex-col gap-2 text-sm">
          <a href="/admin/pages" className="hover:underline">
            Pages
          </a>
          <a href="/admin/pages/new" className="hover:underline">
            Add new page
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
