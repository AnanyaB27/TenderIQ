from typing import List, Dict, Any, Optional

class ConfidenceService:
    @staticmethod
    def calculate_confidence_and_risks(
        evaluation_result: Dict[str, Any],
        document_status: str,
        profile_complete: bool,
        citation_validity_summary: Optional[Dict[str, int]] = None
    ) -> Dict[str, Any]:
        
        rule_results = evaluation_result.get("ruleResults", [])
        evidence_coverage = evaluation_result.get("evidenceCoverage", 0.0)
        eligibility = evaluation_result.get("eligibilityStatus", "UNKNOWN")
        
        reasons: List[str] = []
        risk_flags: List[Dict[str, Any]] = []

        # 1. Evaluate Document Processing State
        if document_status != "READY":
            risk_flags.append({
                "category": "DOCUMENT_QUALITY",
                "severity": "HIGH",
                "title": "Document Processing Incomplete",
                "explanation": f"Document status is {document_status}. Evaluation results may lack full context."
            })

        # 2. Evaluate Rule Status Distribution (PASS / FAIL / UNKNOWN)
        unknown_count = sum(1 for r in rule_results if r.get("status") == "UNKNOWN")
        mandatory_fails = sum(1 for r in rule_results if r.get("status") == "FAIL" and r.get("is_mandatory", False))

        if mandatory_fails > 0:
            risk_flags.append({
                "category": "ELIGIBILITY_GAPS",
                "severity": "HIGH",
                "title": "Mandatory Requirement Failure",
                "explanation": f"{mandatory_fails} mandatory requirement(s) failed compliance verification."
            })

        if unknown_count > 0:
            risk_flags.append({
                "category": "UNKNOWN_REQUIREMENTS",
                "severity": "MEDIUM",
                "title": "Unverified Requirements",
                "explanation": f"{unknown_count} requirement(s) returned UNKNOWN status due to insufficient matching evidence."
            })

        # 3. Evaluate Evidence Coverage
        reasons.append(f"Evidence coverage stands at {evidence_coverage:.1f}%.")
        if evidence_coverage < 50.0:
            risk_flags.append({
                "category": "EVIDENCE_COVERAGE",
                "severity": "HIGH",
                "title": "Low Evidence Coverage",
                "explanation": "Less than half of the evaluated requirements are supported by validated document excerpts."
            })

        # 4. Profile Completeness Check
        if not profile_complete:
            risk_flags.append({
                "category": "PROFILE_COMPLETENESS",
                "severity": "MEDIUM",
                "title": "Incomplete Organization Profile",
                "explanation": "Key capability or turnover fields are missing from your MSME profile, limiting matching precision."
            })

        # 5. Determine Categorical Confidence Level
        if document_status != "READY" or evidence_coverage < 30.0 or not rule_results:
            confidence_level = "UNAVAILABLE"
            reasons.append("Insufficient processed evidence to establish a reliable evaluation confidence.")
        elif evidence_coverage >= 80.0 and unknown_count == 0 and mandatory_fails == 0 and document_status == "READY":
            confidence_level = "HIGH"
            reasons.append("Strong evidence coverage with zero unknown requirements or mandatory failures.")
        elif evidence_coverage >= 50.0 and mandatory_fails == 0:
            confidence_level = "MEDIUM"
            reasons.append("Moderate evidence coverage with minor gaps or unverified requirements.")
        else:
            confidence_level = "LOW"
            reasons.append("Significant evidence gaps, unverified rules, or mandatory requirement failures detected.")

        return {
            "confidence": {
                "level": confidence_level,
                "reasons": reasons
            },
            "riskFlags": risk_flags
        }