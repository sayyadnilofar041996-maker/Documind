"""
DocuMind - core/constants.py
Purpose : Shared application constants
"""

SUPPORTED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/javascript",
    "text/x-python"
]

MAX_SYMBOLS_FILENAME = 255
SAFE_FILENAME_PATTERN = r"^[a-zA-Z0-9._-]+$"
