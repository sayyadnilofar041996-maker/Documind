"""
DocuMind - core/constants.py
Purpose : Shared application constants
"""

SUPPORTED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/markdown",
    "application/javascript",
    "text/javascript",
    "application/x-javascript",
    "text/x-javascript",
    "text/x-python",
    "text/css",
    "text/html",
    "text/x-c",
    "text/x-chdr",
    "text/x-c++src",
    "text/x-c++hdr",
    "text/x-java",
    "text/x-java-source",
    "text/x-script.python",
    "application/json",
    "application/x-sh",
    "text/x-sh",
    "application/x-typescript",
    "text/typescript"
]

MAX_SYMBOLS_FILENAME = 255
SAFE_FILENAME_PATTERN = r"^[a-zA-Z0-9._-]+$"
