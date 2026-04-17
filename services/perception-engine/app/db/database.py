"""Database connection management"""

from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from app.config import get_settings

# Create async engine
engine = None
async_session = None

def init_engine(database_url: str):
    """Initialize database engine"""
    global engine, async_session
    
    # Convert to async driver if needed
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(
        database_url,
        echo=False,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True
    )
    
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    return engine

async def init_db(database_url: str):
    """Initialize database (create tables)"""
    from app.db.models import Base
    
    init_engine(database_url)
    
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    """Close database connections"""
    if engine:
        await engine.dispose()

@asynccontextmanager
async def get_db_session():
    """Get database session context manager"""
    if not async_session:
        raise RuntimeError("Database not initialized. Call init_db first.")
    
    session = async_session()
    try:
        yield session
    finally:
        await session.close()
