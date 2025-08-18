import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getSuggestionsByDocumentId({ documentId }: { documentId: string }) {
  // Placeholder function for suggestions
  // This will be implemented when the suggestions table is created
  return [];
}

export async function getProjectById(id: string) {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    
    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function getAllProjects() {
  try {
    const allProjects = await db.select().from(projects);
    return allProjects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}