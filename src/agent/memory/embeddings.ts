import OpenAI from 'openai';

/**
 * Generates embeddings for a given text using OpenAI's API
 * @param text The text to generate embeddings for
 * @param apiKey The OpenAI API key
 * @returns A promise that resolves to the embedding vector
 */
export async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required for generating embeddings');
  }

  const openai = new OpenAI({
    apiKey,
  });

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
} 