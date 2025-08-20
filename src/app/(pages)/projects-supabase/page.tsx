import { createClient } from "@/lib/supabase/server";
import type { Database } from "../../../../database.types";

// Define the type for a project row from Supabase
export type Project = Database["public"]["Tables"]["projects"]["Row"];

export default async function ProjectsSupabasePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load projects: {error.message}
      </div>
    );
  }

  const projects = (data ?? []) as Project[];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Completion
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {project.id}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {project.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {project.description ?? "—"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {project["start date"] ?? "—"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {project["est completion"] ?? "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

