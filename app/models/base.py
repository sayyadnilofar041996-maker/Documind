"""
DocuMind - models/base.py
Purpose : Shared SQLAlchemy DeclarativeBase
"""
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Shared DeclarativeBase for all ORM models."""
    pass
