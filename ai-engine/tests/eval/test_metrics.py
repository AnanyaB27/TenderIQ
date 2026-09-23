from app.evaluation.metrics import (
    calculate_precision_recall_f1,
    calculate_recall_at_k,
    calculate_mrr,
    calculate_citation_validity,
    calculate_rule_agreement
)

def test_precision_recall_f1():
    # Perfect score
    p, r, f1 = calculate_precision_recall_f1(tp=10, fp=0, fn=0)
    assert p == 1.0 and r == 1.0 and f1 == 1.0
    
    # Zero match
    p, r, f1 = calculate_precision_recall_f1(tp=0, fp=5, fn=5)
    assert p == 0.0 and r == 0.0 and f1 == 0.0

def test_recall_at_k():
    retrieved = ["c1", "c2", "c3", "c4", "c5"]
    relevant = ["c3", "c9"]
    # c3 is hit in top 5. c9 is missed. 1/2 = 0.5
    assert calculate_recall_at_k(retrieved, relevant, k=5) == 0.5
    
    # Zero match
    assert calculate_recall_at_k(["c1"], ["c9"], k=5) == 0.0

def test_mrr():
    retrieved = ["c1", "c2", "c3"]
    relevant = ["c2"]
    # c2 is at rank 2. MRR = 1/2 = 0.5
    assert calculate_mrr(retrieved, relevant) == 0.5

def test_citation_validity():
    assert calculate_citation_validity(10, 8) == 0.8
    assert calculate_citation_validity(0, 0) == 0.0

def test_rule_agreement():
    assert calculate_rule_agreement("PASS", "PASS") is True
    assert calculate_rule_agreement("UNKNOWN", "FAIL") is False