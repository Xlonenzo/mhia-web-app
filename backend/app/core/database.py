from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Engine configuration with Windows encoding handling
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 10,
    "max_overflow": 20,
    "echo": False  # Set to True for SQL debugging
}

# Add Windows-specific psycopg2 options if using PostgreSQL
if settings.DATABASE_URL.startswith("postgresql"):
    engine_kwargs.update({
        "connect_args": {
            "client_encoding": "utf8",
            "options": "-c timezone=UTC"
        }
    })

try:
    engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
    # Test the connection
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    logger.info("Database connection established successfully")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    # Fallback to a simpler configuration
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"client_encoding": "utf8"}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()