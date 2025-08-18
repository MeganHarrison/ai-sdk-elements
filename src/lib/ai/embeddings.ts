import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { db } from '@/lib/db';
import { embeddings as embeddingsTable, resources } from '@/lib/db/schema';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const embeddingModel = openai.embedding('text-embedding-ada-002');

export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

export async function generateEmbeddings(
  values: string[],
): Promise<number[][]> {
  const inputs = values.map(value => value.replaceAll('\\n', ' '));
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: inputs,
  });
  return embeddings;
}

export async function createResource(content: string, title?: string) {
  try {
    // Create the resource
    const [resource] = await db
      .insert(resources)
      .values({
        content,
        title,
      })
      .returning();

    // Generate and store embeddings
    const chunks = splitIntoChunks(content);
    const embeddings = await generateEmbeddings(chunks);

    const embeddingRecords = chunks.map((chunk, i) => ({
      id: nanoid(),
      resourceId: resource.id,
      content: chunk,
      embedding: embeddings[i],
    }));

    await db.insert(embeddingsTable).values(embeddingRecords);

    return resource;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

function splitIntoChunks(text: string, maxChunkSize = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function findRelevantContent(userQuery: string, limit = 4) {
  try {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarity = sql<number>`1 - (${cosineDistance(
      embeddingsTable.embedding,
      userQueryEmbedded,
    )})`;

    const similarGuides = await db
      .select({
        id: embeddingsTable.id,
        resourceId: embeddingsTable.resourceId,
        content: embeddingsTable.content,
        similarity,
      })
      .from(embeddingsTable)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(limit);

    return similarGuides;
  } catch (error) {
    console.error('Error finding relevant content:', error);
    throw error;
  }
}