from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from models import Base

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@postgres/sd_controlnet"

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,  # Limit the number of simultaneous connections
    max_overflow=20  # Allow additional connections if needed
)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with async_session() as session:
        yield session