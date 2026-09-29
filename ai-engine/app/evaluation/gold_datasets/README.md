# TenderIQ Gold Dataset

**STATUS:** No real tender benchmark dataset is currently included in the repository.

This directory houses the versioned schema and future manual annotations used to benchmark the TenderIQ AI pipeline.

## Annotation Workflow

When real tender PDFs are collected, follow this strict pipeline to populate the evaluation dataset:

1. **Collect & Ingest:** Ingest the real tender PDF via the standard `TenderDocumentEntity` flow to generate stable `document_id` and chunk hashes.
2. **Manual Annotation:** Create a JSON file conforming to `schema.py` (`GoldDataset`).
3. **Record Metadata:** For every explicit requirement in the document, assign a `RequirementType`, `is_mandatory` flag, and `expected_source_page`.
4. **Link Chunks (Optional but Recommended):** Identify the specific `chunk_id`s that semantically cover the requirement to calculate Retrieval `Recall@K`.
5. **Version Control:** Save the dataset as `v{X}.{Y}.json` and commit it.
6. **Execution:** Pass the JSON file and system prediction outputs to `eval_runner.py`.

_Note: Never place system predictions in this directory. This directory is strictly for human-verified ground-truth data._
