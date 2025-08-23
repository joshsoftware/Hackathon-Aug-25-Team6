import sys
import traceback
from pathlib import Path

# Ensure project root (containing the 'app' package) is on sys.path
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

try:
    import app.backend.service.parser as parser

    print("OK: parser module imported successfully")
    have_pymupdf = getattr(parser, "_HAVE_PYMUPDF", None)
    have_pypdf = getattr(parser, "_HAVE_PYPDF", None)
    print(f"PDF backends -> PyMuPDF: {have_pymupdf}, pypdf: {have_pypdf}")
except Exception:
    print("FAIL: importing parser raised:")
    traceback.print_exc()
    sys.exit(1)
