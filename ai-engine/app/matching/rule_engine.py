from typing import List
from app.matching.models import (
    OrganizationCapabilities, 
    TenderRequirement, 
    RuleEvaluation, 
    RuleStatus, 
    RequirementType
)

class RuleEngine:
    """
    Evaluates structured tender requirements against known organization capabilities purely deterministically.
    """
    def evaluate(self, requirements: List[TenderRequirement], org: OrganizationCapabilities) -> List[RuleEvaluation]:
        results = []
        for req in requirements:
            if req.type == RequirementType.MIN_TURNOVER:
                results.append(self._eval_numeric(req, org.turnover_cr, "INR Crores"))
            elif req.type == RequirementType.MIN_EXPERIENCE:
                results.append(self._eval_numeric(req, org.experience_years, "Years"))
            elif req.type == RequirementType.REQUIRED_CERTIFICATION:
                results.append(self._eval_certification(req, org.certifications))
            elif req.type == RequirementType.LOCATION_REQUIREMENT:
                results.append(self._eval_location(req, org.locations))
            else:
                results.append(RuleEvaluation(
                    rule_id=req.id,
                    requirement_type=req.type,
                    status=RuleStatus.UNKNOWN,
                    requirement_text=req.raw_text,
                    organization_value="N/A",
                    reason="Unsupported requirement type for deterministic evaluation.",
                    is_mandatory=req.is_mandatory
                ))
        return results

    def _eval_numeric(self, req: TenderRequirement, org_val: float | None, unit: str) -> RuleEvaluation:
        if req.value_numeric is None:
            return RuleEvaluation(
                rule_id=req.id, requirement_type=req.type, status=RuleStatus.UNKNOWN,
                requirement_text=req.raw_text, organization_value=f"{org_val} {unit}" if org_val is not None else "Missing",
                reason="Tender requirement lacks a parseable numeric threshold.", is_mandatory=req.is_mandatory
            )
        if org_val is None:
            return RuleEvaluation(
                rule_id=req.id, requirement_type=req.type, status=RuleStatus.UNKNOWN,
                requirement_text=req.raw_text, organization_value="Data Missing",
                reason=f"Organization profile is missing '{req.type.value}' data.", is_mandatory=req.is_mandatory
            )

        passed = org_val >= req.value_numeric
        return RuleEvaluation(
            rule_id=req.id,
            requirement_type=req.type,
            status=RuleStatus.PASS if passed else RuleStatus.FAIL,
            requirement_text=req.raw_text,
            organization_value=f"{org_val} {unit}",
            reason=f"Org value ({org_val}) is {'greater than or equal to' if passed else 'less than'} required ({req.value_numeric}).",
            is_mandatory=req.is_mandatory
        )

    def _eval_certification(self, req: TenderRequirement, org_certs: List[str]) -> RuleEvaluation:
        if not req.value_text:
            return RuleEvaluation(
                rule_id=req.id, requirement_type=req.type, status=RuleStatus.UNKNOWN,
                requirement_text=req.raw_text, organization_value=", ".join(org_certs) or "None",
                reason="Tender requirement lacks a specific certification name.", is_mandatory=req.is_mandatory
            )
        
        target = req.value_text.strip().lower()
        has_cert = any(target in cert.strip().lower() for cert in org_certs)
        
        return RuleEvaluation(
            rule_id=req.id,
            requirement_type=req.type,
            status=RuleStatus.PASS if has_cert else RuleStatus.FAIL,
            requirement_text=req.raw_text,
            organization_value=", ".join(org_certs) if org_certs else "None Held",
            reason=f"Certification '{req.value_text}' was {'found' if has_cert else 'not found'} in org profile.",
            is_mandatory=req.is_mandatory
        )

    def _eval_location(self, req: TenderRequirement, org_locs: List[str]) -> RuleEvaluation:
        if not req.value_text:
            return RuleEvaluation(
                rule_id=req.id, requirement_type=req.type, status=RuleStatus.UNKNOWN,
                requirement_text=req.raw_text, organization_value=", ".join(org_locs) or "None",
                reason="Location requirement lacked specific target.", is_mandatory=req.is_mandatory
            )
        
        target = req.value_text.strip().lower()
        has_loc = any(target in loc.strip().lower() for loc in org_locs)
        
        return RuleEvaluation(
            rule_id=req.id,
            requirement_type=req.type,
            status=RuleStatus.PASS if has_loc else RuleStatus.FAIL,
            requirement_text=req.raw_text,
            organization_value=", ".join(org_locs) if org_locs else "None Registered",
            reason=f"Location '{req.value_text}' was {'matched' if has_loc else 'not matched'}.",
            is_mandatory=req.is_mandatory
        )