import re

class FormatNormalizer:
    @staticmethod
    def normalize(text: str) -> str:
        """
        Normalizes extracted text to prepare it for future chunking.
        - Removes excessive inline whitespace.
        - Standardizes paragraph breaks without destroying headings/lists.
        """
        if not text:
            return ""
        
        # Replace 3 or more consecutive newlines with exactly 2 (standard paragraph break)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Replace excessive horizontal whitespace with a single space
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Strip trailing/leading whitespace
        return text.strip()
