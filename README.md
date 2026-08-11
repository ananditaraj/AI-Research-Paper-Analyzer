# AI Research Paper Analyzer

## Setup

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
   If no requirements file exists yet, install the main dependencies manually:
   ```bash
   pip install fastapi uvicorn python-dotenv fitz sentence-transformers rank-bm25 openai numpy
   ```

2. Create a environment file named `.env` in the project root and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. Start the app:
   ```bash
   python main.py
   ```

## Fix for the startup error

If you see this error:

```text
ValueError: GROQ_API_KEY not set in environment variables.
```

it means the app could not find your Groq API key. Fix it by:

- creating a `.env` file in the project folder,
- adding `GROQ_API_KEY=...`, and
- restarting the terminal or VS Code window after saving the file.

### Windows PowerShell

```powershell
$env:GROQ_API_KEY="your_groq_api_key_here"
python main.py
```

## Notes

- Do not commit your `.env` file to Git.
- If you are using VS Code, make sure the terminal where you run the app has the updated environment variables.

