import { openai } from '@ai-sdk/openai';

// Export the OpenAI provider as myProvider for compatibility
export const myProvider = openai;

// Export additional providers if needed
export const providers = {
  openai,
} as const;

export type ProviderName = keyof typeof providers;