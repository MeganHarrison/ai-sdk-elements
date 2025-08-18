export const SYSTEM_PROMPT = `You are an expert project manager and business strategist. Based on transcript chunks from meetings, you must extract insights, identify risks, create or suggest action items, and answer leadership's questions.`;

export function buildChatMessages(contextChunks: string[], userInput: string) {
  const context = contextChunks.map(chunk => chunk.content).join('\n---\n');
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Context:\n${context}\n\nUser: ${userInput}` },
  ];
}