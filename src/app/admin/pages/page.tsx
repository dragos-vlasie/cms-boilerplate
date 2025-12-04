// src/app/admin/pages/page.tsx
import { db } from "~/server/db";
import Link from "next/link";

export default async function PagesListPage() {
  const pages = await db.page.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pages</h1>

      {pages.length === 0 ? (
        <p className="text-sm text-slate-600">No pages yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Title</th>
              <th className="py-2">Path</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b">
                <td className="py-2">{page.title}</td>
                <td className="py-2">{page.path}</td>
                <td className="py-2">{page.status}</td>
                <td className="py-2">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
