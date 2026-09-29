import pytest
from app.evaluation.schema import GoldDataset, GoldDocument, GoldRequirement, RequirementType
from app.evaluation.eval_runner import EvaluationRunner

def test_schema_validation_success():
    req = GoldRequirement(
        id="req-1",
        requirement_text="Turnover must be 10 Cr",
        requirement_type=RequirementType.MIN_TURNOVER,
        is_mandatory=True,
        expected_source_page=4
    )
    assert req.requirement_type == "MIN_TURNOVER"

def test_schema_validation_failure():
    with pytest.raises(ValueError):
        GoldRequirement(
            id="req-1",
            requirement_text="Bad Type",
            requirement_type="INVALID_TYPE", # Fails Enum validation
            is_mandatory=True
        )

def test_eval_runner_empty_predictions():
    dataset = GoldDataset(
        version="1.0.0",
        description="Test",
        documents=[
            GoldDocument(
                document_id="doc-1",
                tender_source="CPPP",
                requirements=[
                    GoldRequirement(
                        id="req-1",
                        requirement_text="Turnover 10Cr",
                        requirement_type=RequirementType.MIN_TURNOVER,
                        is_mandatory=True
                    )
                ]
            )
        ]
    )
    
    runner = EvaluationRunner()
    runner.dataset_version = dataset.version
    
    # Empty predictions -> 0 TP, 1 FN
    report = runner.generate_report(dataset, system_predictions={})
    assert report["extraction_metrics"]["precision"] == 0.0
    assert report["extraction_metrics"]["recall"] == 0.0