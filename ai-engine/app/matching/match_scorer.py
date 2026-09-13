from typing import List, Tuple
from app.matching.models import RuleEvaluation, EligibilityStatus, RuleStatus

class MatchScorer:
    """
    Calculates a transparent, deterministic match score based on rule evaluation outcomes.
    Enforces critical requirement failures overrides.
    """
    def calculate(self, results: List[RuleEvaluation]) -> Tuple[int, EligibilityStatus, List[RuleEvaluation], List[RuleEvaluation]]:
        if not results:
            return (0, EligibilityStatus.UNKNOWN, [], [])

        critical_failures = []
        unknown_reqs = []
        total_evaluable = 0
        passed = 0

        for r in results:
            if r.status == RuleStatus.FAIL and r.is_mandatory:
                critical_failures.append(r)
            if r.status == RuleStatus.UNKNOWN:
                unknown_reqs.append(r)
            
            # Score formula: Exclude UNKNOWN from the direct denominator to not artificially deflate/inflate,
            # but they will reduce overall eligibility status to CONDITIONAL.
            if r.status in (RuleStatus.PASS, RuleStatus.FAIL):
                total_evaluable += 1
                if r.status == RuleStatus.PASS:
                    passed += 1

        # Base math score 0-100
        score = int((passed / total_evaluable * 100)) if total_evaluable > 0 else 0

        # Eligibility Status Logic
        if critical_failures:
            status = EligibilityStatus.INELIGIBLE
        elif total_evaluable == 0 and len(unknown_reqs) > 0:
            status = EligibilityStatus.UNKNOWN
        elif len(unknown_reqs) > 0:
            status = EligibilityStatus.CONDITIONAL
        else:
            status = EligibilityStatus.ELIGIBLE

        return (score, status, critical_failures, unknown_reqs)