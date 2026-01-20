from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import os
import PyPDF2
import email
from email import policy


app = FastAPI()


with open("trained_model.pkl", "rb") as f:
    model = pickle.load(f)
    
with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)
    
class FileRequest(BaseModel):
          filepath: str
          
def extract_text(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()
    
    
    if not ext:
        with open(filepath, "rb") as f:
            header = f.read(8)
           
            if header.startswith(b'%PDF'):
                ext = ".pdf"
          
            elif b'From:' in header or b'Subject:' in header or b'To:' in header:
                ext = ".eml"
            else:
              
                ext = ".txt"
    
    if ext == ".txt":
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
        
    if ext == ".pdf":
        with open (filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text  
        
    if ext == ".eml":
        with open(filepath, "rb") as f:
            msg = email.message_from_binary_file(f, policy=policy.default)
            text = ""
            if msg['Subject']:
                text += msg['Subject'] + "\n"
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        text += part.get_content()
            else:
                text += msg.get_content()
            return text 
        
@app.post("/analyze")
def analyze_email(req : FileRequest):
    text = extract_text(req.filepath)
    
    vector = vectorizer.transform([text])
    spam_prob = model.predict_proba(vector)[0][1]
    
    
    return{
        "is_spam": bool(spam_prob >= 0.5),
        "confidence_score": round(float(spam_prob), 3),
        "reasoning": "Prediction based on patterns learned from real Enron spam and ham emails."
    }
    
    
    
    