from celery import Celery
from sqlalchemy import create_engine
from app.config import get_settings

settings = get_settings()

# ── Celery App Configuration ───────────────────────────────────
# We use Redis as both broker and backend.
# result_backend is used to store task results.
app = Celery(
    "documind",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["worker.tasks"]  # Ensure tasks are discovered
)

from celery.schedules import crontab

# ── Celery Settings ────────────────────────────────────────────
# task_acks_late=True           -> Task is acknowledged AFTER execution (vs before)
# worker_prefetch_multiplier=1 -> One task per worker at a time (better for long tasks)
# task_reject_on_worker_lost=True -> Re-queue task if worker crashes during execution
app.conf.update(
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,
    worker_concurrency=settings.celery_worker_concurrency,
    task_soft_time_limit=settings.celery_task_soft_time_limit,
    task_time_limit=settings.celery_task_time_limit,
    beat_schedule={
        "nightly-cleanup": {
            "task": "cleanup_failed_documents",
            "schedule": crontab(hour=0, minute=0),
        },
    },
)

"""
Why a SYNC SQLAlchemy engine?
-----------------------------
Celery workers (by default) run in a synchronous environment using prefork (multiprocessing).
While it is possible to use async/await inside Celery tasks using libraries like celery-pool-asyncio,
the standard and most stable approach is to use synchronous database drivers (psycopg2) 
inside the worker processes. This avoids complex asyncio event loop management 
across process boundaries and is generally more idiomatic for background workers.
"""

# Derive sync database URL from async URL (postgresql+asyncpg -> postgresql+psycopg2)
sync_database_url = settings.database_url.replace("asyncpg", "psycopg2")

engine = create_engine(
    sync_database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)
