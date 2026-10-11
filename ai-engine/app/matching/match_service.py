import json
import logging
import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import google.generativeai as genai

logger = logging.getLogger(__name__)

class DocumentNotProcessedError(Exception):
    pass

class MatchService:
    def __init__(self, db: AsyncSession = None, *args, **kwargs):
        self.db = db

    async def evaluate_tender(self, document_id: str, org_profile_text: str, *args, **kwargs) -> dict:
        if not self.db:
            raise RuntimeError("Database session is missing. Cannot evaluate tender.")

        logger.info(f"Starting real AI evaluation for document: {document_id}")

        # 1. Fetch the actual processed document chunks from PostgreSQL
        query = text("""
            SELECT id, page_number, section_title, content 
            FROM tender_document_chunks 
            WHERE tender_document_id = :doc_id
            ORDER BY chunk_index ASC
            LIMIT 30
        """)
        result = await self.db.execute(query, {"doc_id": document_id})
        chunks = result.fetchall()

        if not chunks:
            logger.warning(f"No chunks found for document {document_id}. It may not be processed yet.")
            raise DocumentNotProcessedError("Tender Document has not been fully processed.")

        # 2. Assemble context mapping using simple integer indices
        context_parts = []
        chunk_map = {}
        
        for idx, c in enumerate(chunks):
            # FIX: Cast the asyncpg UUID object to a string so it is JSON serializable
            chunk_id = str(c[0])
            page = c[1]
            section = c[2]
            content = c[3]
            
            chunk_map[str(idx)] = {"chunk_id": chunk_id, "page": page, "section": section}
            context_parts.append(f"--- Chunk Index: {idx} (Page {page}, {section}) ---\n{content}\n")
        
        tender_context = "\n".join(context_parts)

        # 3. Authenticate with Gemini
        api_key = os.environ.get("GOOGLE_API_KEY", "").strip()
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing. Cannot perform evaluation.")
        
        genai.configure(api_key=api_key)
        
        # 4. Construct the LLM Prompt
        prompt = f"""
        You are an expert procurement AI. Evaluate the MSME organization's eligibility for the tender based ONLY on the provided context.
        
        ORGANIZATION PROFILE:
        {org_profile_text}
        
        TENDER CONTEXT (Excerpts):
        {tender_context[:30000]}
        
        INSTRUCTIONS:
        1. Compare the organization's Turnover, Experience, and Certifications against the tender requirements.
        2. Output ONLY a valid JSON object matching the exact schema below. Do not include markdown formatting like ```json.
        
        SCHEMA:
        {{
            "matchScore": <integer between 0 and 100>,
            "eligibilityStatus": "<High Ineligible Low Match Medium |>",
            "summary": "<A 2-3 eligibility fit of sentence summary the>",
            "gaps": ["<List missing of or profile requirements weaknesses>"],
            "recommendations": ["<Actionable advice bid for the>"],
            "ruleResults": [
                {{
                    "ruleId": "<Generate ID a unique>",
                    "requirementType": "<TURNOVER CERTIFICATION EXPERIENCE LOCATION OTHER |>",
                    "status": "<PASS FAIL UNKNOWN |>",
                    "requirementText": "<The context extracted from rule specific tender the>",
                    "organizationValue": "<The MSME from profile relevant the value>",
                    "reason": "<Why failed, is it or passed, unknown>",
                    "isMandatory": <true or false>,
                    "evidence": [
                        {{
                            "chunkIndex": "<The (e.g., 0, 1, 2) CONTEXT TENDER exact from index integer proves that the this>",
                            "excerpt": "<The context from sentence specific the>"
                        }}
                    ]
                }}
            ]
        }}
        """
        
       # 5. Prioritize stable, currently active Gemini models
        models_to_try = [
            'gemini-3.5-flash',
            'gemini-3.1-flash-lite',
            'gemini-2.5-flash',
            'gemini-2.0-flash'
        ]
        
        response = None
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                logger.info(f"Model {model_name} succeeded.")
                break
            except Exception as e:
                logger.warning(f"Model {model_name} failed: {e}")
                continue
                
        if not response:
            raise RuntimeError("All Gemini evaluation models failed (404 Not Found).")
            
        # 6. Parse the AI Evaluation
        try:
            resp_text = response.text.strip()
            
            if resp_text.startswith("```json"):
                resp_text = resp_text[7:-3].strip()
            elif resp_text.startswith("```"):
                resp_text = resp_text[3:-3].strip()
                
            eval_data = json.loads(resp_text)
            
            # 7. Hydrate evidence using the integer index mapping
            if "ruleResults" in eval_data:
                for rule in eval_data["ruleResults"]:
                    rule["rule_id"] = rule.get("ruleId", str(uuid.uuid4()))
                    rule["requirement_type"] = rule.get("requirementType", "OTHER")
                    rule["requirement_text"] = rule.get("requirementText", "")
                    rule["organization_value"] = rule.get("organizationValue", "")
                    rule["is_mandatory"] = rule.get("isMandatory", False)
                    
                    hydrated_evidence = []
                    for ev in rule.get("evidence", []):
                        c_idx = str(ev.get("chunkIndex", ""))
                        if c_idx in chunk_map:
                            hydrated_evidence.append({
                                "chunk_id": chunk_map[c_idx]["chunk_id"],
                                "document_id": document_id,
                                "page_start": chunk_map[c_idx]["page"],
                                "page_end": chunk_map[c_idx]["page"],
                                "section_heading": chunk_map[c_idx]["section"],
                                "excerpt": ev.get("excerpt", ""),
                                "validation_status": "VALID",
                                "validation_reason": "Matched by AI logic."
                            })
                    rule["evidence"] = hydrated_evidence
            
            # Attach dual-keys for serialization
            eval_data["match_score"] = eval_data.get("matchScore", 0)
            eval_data["eligibility_status"] = eval_data.get("eligibilityStatus", "Unknown")
            eval_data["evidenceCoverage"] = 100.0 if eval_data.get("ruleResults") else 0.0
            eval_data["rule_results"] = eval_data.get("ruleResults", [])
            
            return eval_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON: {e}\nRaw LLM Output:\n{response.text}")
            raise ValueError("AI produced invalid JSON during evaluation.")
        except Exception as e:
            logger.error(f"Evaluation generation error: {e}")
            raise RuntimeError(f"Real AI Evaluation failed: {str(e)}")