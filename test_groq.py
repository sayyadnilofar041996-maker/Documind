from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
print(f"API Key start: {api_key[:10]}...")

client = Groq(api_key=api_key)

try:
    print("Sending test request to Groq...")
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": "Hello, respond with 'Ok'."}],
    )
    print(f"Response: {completion.choices[0].message.content}")
except Exception as e:
    print(f"Error: {e}")
