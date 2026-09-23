import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List
import re

from app.ingestion.connectors.base_connector import TenderSourceConnector, NormalizedTender

class CPPPConnector(TenderSourceConnector):
    @property
    def source_name(self) -> str:
        return "CPPP"

    async def fetch_tenders(self, limit: int = 50) -> List[NormalizedTender]:
        # Public RSS feed for latest active tenders on CPPP
        url = "https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata/rss"
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
            except httpx.HTTPError as e:
                print(f"CPPP Ingestion Error: {e}")
                return [] # Handle gracefully, don't crash the pipeline

        tenders = []
        try:
            root = ET.fromstring(response.content)
            # Standard RSS channel -> item structure
            for item in root.findall('./channel/item')[:limit]:
                title = item.findtext('title', default='Unknown Title')
                link = item.findtext('link', default='')
                description = item.findtext('description', default='')
                pub_date_str = item.findtext('pubDate', default='')

                # Extract reference number cleanly (usually embedded in the title or link)
                # Fallback to a hash if completely missing to prevent DB constraint failure
                ref_match = re.search(r'Ref\s*No:\s*([A-Za-z0-9/_-]+)', description)
                ref_number = ref_match.group(1) if ref_match else f"CPPP-{abs(hash(title))}"

                # Extract issuing authority safely
                authority_match = re.search(r'Organisation:\s*([^<]+)', description)
                authority = authority_match.group(1).strip() if authority_match else "Govt of India"

                # Parse date safely (RSS dates are usually RFC 822)
                pub_date = None
                if pub_date_str:
                    try:
                        pub_date = datetime.strptime(pub_date_str, "%a, %d %b %Y %H:%M:%S %Z")
                    except ValueError:
                        pub_date = datetime.utcnow()

                tenders.append(NormalizedTender(
                    referenceNumber=ref_number,
                    title=title.strip(),
                    description=description.strip()[:1000], # Truncate massive HTML blocks
                    issuingAuthority=authority,
                    procurementCategory="Government",
                    estimatedValue=None, # RSS rarely contains structured financial data
                    publishedAt=pub_date,
                    submissionDeadline=None,
                    source=self.source_name,
                    sourceUrl=link
                ))
        except ET.ParseError as e:
            print(f"CPPP XML Parse Error: {e}")

        return tenders
