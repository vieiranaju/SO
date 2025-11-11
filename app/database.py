import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:12345@db-postgres:5432/petshop")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
	"""Dependency that yields a DB session. Ainda não usado pelo CRUD."""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()

