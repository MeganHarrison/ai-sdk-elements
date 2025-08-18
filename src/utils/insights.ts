import { queryEmbeddings } from './embeddings';
import { buildChatMessages } from './prompts';
import { openai } from '@/lib/openai';

export async function generateInsightFromTranscript(userInput: string) {
  const contextChunks = await queryEmbeddings(userInput);
  const messages = buildChatMessages(contextChunks, userInput);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  });

  return completion.choices[0].message.content;
}