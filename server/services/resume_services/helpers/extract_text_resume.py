from PyPDF2 import PdfReader

import io

def extract_text_from_pdf(file):
    try:
        pdf_reader = PdfReader(io.BytesIO(file))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None