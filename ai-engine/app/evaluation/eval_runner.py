import json
from typing import Dict, Any, List
from app.evaluation.schema import GoldDataset, GoldDocument
from app.evaluation.metrics import (
    calculate_precision_recall_f1,
    calculate_recall_at_k,
    calculate_citation_validity,
    calculate_rule_agreement
)

class EvaluationRunner:
    def __init__(self):
        self.dataset_version = "UNKNOWN"
        
    def load_dataset(self, file_path: str) -> GoldDataset:
        """Loads and validates a gold dataset against the Pydantic schema."""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        dataset = GoldDataset(**data)
        self.dataset_version = dataset.version
        return dataset

    def generate_report(self, gold_dataset: GoldDataset, system_predictions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Matches system predictions against gold records to compute implemented metrics.
        Returns a structured evaluation report suitable for export/paper generation.
        """
        total_docs = len(gold_dataset.documents)
        total_gold_reqs = 0
        
        # Extraction Metrics accumulators
        tp = 0; fp = 0; fn = 0
        
        # Retrieval Metrics accumulators
        recall_at_5_sum = 0.0
        retrieval_evaluated_count = 0
        
        # Rule Agreement accumulators
        total_rules_evaluated = 0
        agreed_rules = 0

        for doc in gold_dataset.documents:
            total_gold_reqs += len(doc.requirements)
            doc_predictions = system_predictions.get(doc.document_id, {})
            
            # Simulated matching for Extraction (in real world, map via ID or embedding similarity)
            predicted_req_ids = doc_predictions.get("extracted_requirement_ids", [])
            gold_req_ids = [r.id for r in doc.requirements]
            
            doc_tp = sum(1 for pid in predicted_req_ids if pid in gold_req_ids)
            doc_fp = len(predicted_req_ids) - doc_tp
            doc_fn = len(gold_req_ids) - doc_tp
            
            tp += doc_tp; fp += doc_fp; fn += doc_fn

            for req in doc.requirements:
                req_pred = doc_predictions.get("requirements", {}).get(req.id, {})
                
                # Retrieval (Recall@5)
                if req.expected_relevant_chunk_ids:
                    r_at_5 = calculate_recall_at_k(
                        retrieved_ids=req_pred.get("retrieved_chunk_ids", []),
                        relevant_ids=req.expected_relevant_chunk_ids,
                        k=5
                    )
                    recall_at_5_sum += r_at_5
                    retrieval_evaluated_count += 1
                
                # Matching Agreement
                pred_status = req_pred.get("match_status")
                gold_status = "PASS" # In a full schema, gold_status would be predefined based on an assumed org profile
                if pred_status:
                    total_rules_evaluated += 1
                    if calculate_rule_agreement(pred_status, gold_status):
                        agreed_rules += 1

        precision, recall, f1 = calculate_precision_recall_f1(tp, fp, fn)
        avg_recall_at_5 = (recall_at_5_sum / retrieval_evaluated_count) if retrieval_evaluated_count > 0 else 0.0
        rule_accuracy = (agreed_rules / total_rules_evaluated) if total_rules_evaluated > 0 else 0.0

        return {
            "dataset_version": self.dataset_version,
            "documents_evaluated": total_docs,
            "total_annotated_requirements": total_gold_reqs,
            "extraction_metrics": {
                "precision": precision,
                "recall": recall,
                "f1": f1
            },
            "retrieval_metrics": {
                "recall_at_5": avg_recall_at_5
            },
            "matching_metrics": {
                "rule_agreement_accuracy": rule_accuracy
            },
            "latency_metrics": {
                "average_e2e_latency_ms": system_predictions.get("global_average_latency_ms", None)
            }
        }
