import os
import asyncio
import math
import hashlib
from typing import List

import httpx


class EmbeddingClient:
    """
    TenderIQ embedding client.

    Primary:
        Gemini gemini-embedding-001

    Fallback:
        Deterministic local 768-dimensional embeddings.

    The local fallback exists so the TenderIQ demo can continue
    processing documents when the Gemini embedding quota is exhausted.
    """

    def __init__(self, batch_size: int = 50):
        api_key = os.environ.get("GOOGLE_API_KEY")

        self.api_key = api_key.strip() if api_key else None

        self.model_name = "models/gemini-embedding-001"
        self.dimension = 768
        self.batch_size = batch_size

        self.url = (
            "https://generativelanguage.googleapis.com/"
            "v1beta/models/gemini-embedding-001:batchEmbedContents"
        )

        self.use_local_fallback = False

    async def embed_batch(
        self,
        texts: List[str],
    ) -> List[List[float]]:
        """
        Generate embeddings.

        Gemini is attempted first.
        If Gemini quota is exhausted, automatically use
        deterministic local embeddings.
        """

        if not texts:
            return []

        if self.use_local_fallback or not self.api_key:
            print(
                "Using local deterministic embeddings "
                "(Gemini fallback mode)."
            )
            return self._local_embeddings(texts)

        try:
            return await self._gemini_embeddings(texts)

        except Exception as e:
            error_message = str(e)

            if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:
                print(
                    "Gemini embedding quota exhausted. "
                    "Switching to local deterministic embeddings "
                    "for this document."
                )

                self.use_local_fallback = True

                return self._local_embeddings(texts)

            raise

    async def _gemini_embeddings(
        self,
        texts: List[str],
    ) -> List[List[float]]:
        """Generate embeddings using Gemini REST API."""

        vectors: List[List[float]] = []

        async with httpx.AsyncClient(timeout=120.0) as client:

            for i in range(0, len(texts), self.batch_size):
                batch = texts[i:i + self.batch_size]

                requests = []

                for text in batch:
                    requests.append(
                        {
                            "model": self.model_name,
                            "content": {
                                "parts": [
                                    {
                                        "text": text
                                    }
                                ]
                            },
                            "taskType": "RETRIEVAL_DOCUMENT",
                            "outputDimensionality": self.dimension,
                        }
                    )

                payload = {
                    "requests": requests
                }

                response = await client.post(
                    self.url,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": self.api_key,
                    },
                    json=payload,
                )

                if response.status_code != 200:
                    raise RuntimeError(
                        "Gemini Embedding API returned "
                        f"HTTP {response.status_code}: "
                        f"{response.text}"
                    )

                result = response.json()

                embeddings = result.get("embeddings")

                if not embeddings:
                    raise RuntimeError(
                        f"Gemini returned no embeddings: {result}"
                    )

                for embedding in embeddings:
                    values = embedding.get("values")

                    if not values:
                        raise RuntimeError(
                            f"Invalid Gemini embedding: {embedding}"
                        )

                    if len(values) != self.dimension:
                        raise RuntimeError(
                            "Embedding dimension mismatch. "
                            f"Expected {self.dimension}, "
                            f"got {len(values)}"
                        )

                    values = self._normalize(values)

                    vectors.append(values)

                if i + self.batch_size < len(texts):
                    await asyncio.sleep(0.2)

        if len(vectors) != len(texts):
            raise ValueError(
                "Embedding count mismatch. "
                f"Expected {len(texts)}, got {len(vectors)}"
            )

        return vectors

    def _local_embeddings(
        self,
        texts: List[str],
    ) -> List[List[float]]:
        """
        Generate deterministic local embeddings.

        This is intentionally dependency-free and produces exactly
        768 dimensions, matching the pgvector database schema.

        It is a demo/reliability fallback, not a replacement for
        semantic Gemini embeddings in production.
        """

        vectors = []

        for text in texts:
            vector = [0.0] * self.dimension

            words = text.lower().split()

            if not words:
                vectors.append(vector)
                continue

            for word in words:
                digest = hashlib.sha256(
                    word.encode("utf-8")
                ).digest()

                index = int.from_bytes(
                    digest[:4],
                    byteorder="big",
                ) % self.dimension

                sign = 1.0 if digest[4] % 2 == 0 else -1.0

                vector[index] += sign

            vectors.append(self._normalize(vector))

        return vectors

    @staticmethod
    def _normalize(
        vector: List[float],
    ) -> List[float]:
        """L2-normalize a vector."""

        magnitude = math.sqrt(
            sum(value * value for value in vector)
        )

        if magnitude == 0:
            return vector

        return [
            value / magnitude
            for value in vector
        ]