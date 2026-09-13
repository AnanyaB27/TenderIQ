import json
import re
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ValidationError
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from google.api_core.exceptions import GoogleAPIError

router = APIRouter(prefix="/internal/orgs", tags=["match"])

class MatchRequest(BaseModel):
    tender_id: str
    tender_title: str
    tender_description: str
    org_capabilities: str = "General software and hardware development capabilities."
    dynamic_context: str | None = None

class MatchResponse(BaseModel):
    tenderId: str
    organizationId: str
    matchScore: int
    eligibilityStatus: str
    summary: str
    gaps: List[str]
    recommendations: List[str]

@router.post("/{organization_id}/match", response_model=MatchResponse)
async def evaluate_match(organization_id: str, request: MatchRequest):
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Google API key is not configured on the AI Engine.")

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            temperature=0.3,
            max_retries=1
        )
        
        capabilities_to_use = request.dynamic_context if request.dynamic_context else request.org_capabilities

        prompt = f"""
        You are an expert Chief Procurement Analyst and Technical Proposal Writer. 
        Perform a rigorous, detailed gap analysis of the following government tender against the organization's verified profile and capabilities.
        
        --- TENDER DETAILS ---
        Title: {request.tender_title}
        Description: {request.tender_description}
        
        --- ORGANIZATION CAPABILITIES / RAG PROFILE ---
        Profile: {capabilities_to_use}
        
        Provide a highly specific, tailored evaluation. Do not use generic filler. 
        Return ONLY a valid JSON object without markdown code blocks using exact double quotes matching this schema:
        {{
            "match_score": 88,
            "eligibility_status": "Highly Eligible",
            "summary": "Provide a detailed 3-sentence executive summary explaining how the organization's specific technical history directly fulfills this tender's core deliverables.",
            "identified_gaps": ["Detailed technical gap 1", "Detailed logistical gap 2"],
            "bid_recommendations": ["Actionable strategic recommendation 1", "Actionable compliance recommendation 2"]
        }}
        """
        
        result = await llm.ainvoke(prompt)
        raw_content = result.content
        if isinstance(raw_content, list):
            raw_content = "".join([str(item) for item in raw_content])
        raw_content = str(raw_content).strip()

        match = re.search(r'(\{.*\})', raw_content, re.DOTALL)
        if not match:
            raise ValueError("No valid JSON structure found in LLM response.")
            
        json_str = match.group(1)
        parsed_data = json.loads(json_str)

        # Validate structured response using Pydantic
        return MatchResponse(
            tenderId=request.tender_id,
            organizationId=organization_id,
            matchScore=int(parsed_data.get("match_score", 0)),
            eligibilityStatus=str(parsed_data.get("eligibility_status", "Unknown")),
            summary=str(parsed_data.get("summary", "")),
            gaps=list(parsed_data.get("identified_gaps", [])),
            recommendations=list(parsed_data.get("bid_recommendations", []))
        )
        
    except json.JSONDecodeError as e:
        print(f"AI Engine JSON Error: {e}")
        raise HTTPException(status_code=502, detail="Failed to parse structured response from AI model.")
    except GoogleAPIError as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=502, detail="Communication with the AI model failed.")
    except ValidationError as e:
        print(f"Schema Validation Error: {e}")
        raise HTTPException(status_code=502, detail="AI output did not match expected response schema.")
    except ValueError as e:
        print(f"AI Engine Value Error: {e}")
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        print(f"AI Engine Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during AI evaluation.")