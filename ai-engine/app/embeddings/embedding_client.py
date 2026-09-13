import os
from typing import List
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pydantic import SecretStr

class EmbeddingClient:
    """
    Isolated embedding abstraction. Currently configured for Google Gemini.
    """
    def __init__(self, batch_size: int = 100):
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing. Cannot initialize embeddings.")
        
        self.model_name = "models/text-embedding-004"
        self.dimension = 768
        self.batch_size = batch_size
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=self.model_name,
            google_api_key=SecretStr(api_key)
        )

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a batch of texts cleanly and safely."""
        if not texts:
            return []
        
        vectors = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            try:
                # Utilizing async batching from langchain
                batch_vectors = await self.embeddings.aembed_documents(batch)
                vectors.extend(batch_vectors)
            except Exception as e:
                raise RuntimeError(f"Embedding API failed during batch processing: {str(e)}")
        
        if vectors and len(vectors[0]) != self.dimension:
            raise ValueError(f"Dimension mismatch. Expected {self.dimension}, got {len(vectors[0])}")
        
        return vectors