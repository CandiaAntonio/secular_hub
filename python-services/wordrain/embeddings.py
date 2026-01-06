"""
Word2Vec embeddings module for Word Rain visualization.
Uses pre-trained Word2Vec model to get semantic embeddings for words.
"""

import os
import pickle
import numpy as np
from typing import Dict, List, Optional
from gensim.models import KeyedVectors
import gensim.downloader as api

# Cache directory for embeddings
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
EMBEDDINGS_CACHE_FILE = os.path.join(CACHE_DIR, "word_embeddings.pkl")

# Global model instance
_model: Optional[KeyedVectors] = None


def get_model() -> KeyedVectors:
    """
    Load or download the Word2Vec model.
    Uses 'glove-wiki-gigaword-100' for balance of quality and size.
    Alternative: 'word2vec-google-news-300' (larger, more accurate)
    """
    global _model

    if _model is not None:
        return _model

    print("Loading Word2Vec model...")

    # Use GloVe model (smaller, faster to download)
    # Options:
    # - 'glove-wiki-gigaword-100' (~128MB) - good balance
    # - 'glove-wiki-gigaword-300' (~376MB) - better quality
    # - 'word2vec-google-news-300' (~1.6GB) - best for general text

    model_name = 'glove-wiki-gigaword-100'

    try:
        _model = api.load(model_name)
        print(f"Model '{model_name}' loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

    return _model


def get_embedding(word: str, model: Optional[KeyedVectors] = None) -> Optional[np.ndarray]:
    """
    Get the embedding vector for a single word.
    Returns None if word not in vocabulary.
    """
    if model is None:
        model = get_model()

    # Try the word as-is, then lowercase
    for w in [word, word.lower()]:
        if w in model.key_to_index:
            return model[w]

    # For multi-word phrases, average the embeddings
    words = word.lower().split()
    if len(words) > 1:
        vectors = []
        for w in words:
            if w in model.key_to_index:
                vectors.append(model[w])
        if vectors:
            return np.mean(vectors, axis=0)

    return None


def get_embeddings_batch(words: List[str]) -> Dict[str, Optional[np.ndarray]]:
    """
    Get embeddings for a batch of words.
    Returns dict mapping word -> embedding (or None if not found).
    """
    model = get_model()

    # Check cache first
    cache = load_cache()

    result = {}
    words_to_compute = []

    for word in words:
        word_lower = word.lower()
        if word_lower in cache:
            result[word] = cache[word_lower]
        else:
            words_to_compute.append(word)

    # Compute missing embeddings
    for word in words_to_compute:
        embedding = get_embedding(word, model)
        result[word] = embedding

        # Update cache
        if embedding is not None:
            cache[word.lower()] = embedding

    # Save updated cache
    save_cache(cache)

    return result


def load_cache() -> Dict[str, np.ndarray]:
    """Load embeddings cache from disk."""
    os.makedirs(CACHE_DIR, exist_ok=True)

    if os.path.exists(EMBEDDINGS_CACHE_FILE):
        try:
            with open(EMBEDDINGS_CACHE_FILE, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            print(f"Error loading cache: {e}")

    return {}


def save_cache(cache: Dict[str, np.ndarray]) -> None:
    """Save embeddings cache to disk."""
    os.makedirs(CACHE_DIR, exist_ok=True)

    try:
        with open(EMBEDDINGS_CACHE_FILE, 'wb') as f:
            pickle.dump(cache, f)
    except Exception as e:
        print(f"Error saving cache: {e}")


def get_vocabulary_coverage(words: List[str]) -> Dict[str, bool]:
    """
    Check which words are in the model vocabulary.
    Returns dict mapping word -> True/False.
    """
    model = get_model()

    result = {}
    for word in words:
        found = False
        for w in [word, word.lower()]:
            if w in model.key_to_index:
                found = True
                break

        # Check multi-word phrases
        if not found and ' ' in word:
            phrase_words = word.lower().split()
            found = any(w in model.key_to_index for w in phrase_words)

        result[word] = found

    return result
