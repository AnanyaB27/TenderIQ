from typing import List, Tuple, Optional

def calculate_precision_recall_f1(true_positives: int, false_positives: int, false_negatives: int) -> Tuple[float, float, float]:
    """Calculates generic Precision, Recall, and F1 score."""
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0.0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0
    
    if precision + recall > 0:
        f1 = 2 * (precision * recall) / (precision + recall)
    else:
        f1 = 0.0
        
    return precision, recall, f1

def calculate_recall_at_k(retrieved_ids: List[str], relevant_ids: List[str], k: int) -> float:
    """Calculates Recall@K for retrieval performance."""
    if not relevant_ids:
        return 0.0 # Cannot calculate recall if no relevant items exist
    
    retrieved_k = retrieved_ids[:k]
    hits = sum(1 for rel in relevant_ids if rel in retrieved_k)
    return hits / len(relevant_ids)

def calculate_mrr(retrieved_ids: List[str], relevant_ids: List[str]) -> float:
    """Calculates Mean Reciprocal Rank (MRR)."""
    if not relevant_ids or not retrieved_ids:
        return 0.0
        
    for i, ret_id in enumerate(retrieved_ids):
        if ret_id in relevant_ids:
            return 1.0 / (i + 1)
    return 0.0

def calculate_citation_validity(total_citations: int, valid_citations: int) -> float:
    """Calculates the percentage of LLM citations that strictly map to real chunks."""
    if total_citations == 0:
        return 0.0
    return valid_citations / total_citations

def calculate_rule_agreement(predicted_status: str, gold_status: str) -> bool:
    """Calculates strict deterministic match agreement (PASS/FAIL/UNKNOWN)."""
    return predicted_status == gold_status
