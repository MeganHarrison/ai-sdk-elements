export async function queryEmbeddings(query: string) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
  
    const { data } = await supabase.rpc('match_documents', {
      query_embedding: embedding.data[0].embedding,
      match_threshold: 0.78,
      match_count: 10,
    });
  
    return data;
  }
  