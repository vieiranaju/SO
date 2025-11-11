from pydantic import BaseModel
from typing import Optional


class PetCreate(BaseModel):
    name: str
    species: Optional[str] = None
    age: Optional[int] = None


class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    age: Optional[int] = None


class PetOut(BaseModel):
    id: int
    name: str
    species: Optional[str] = None
    age: Optional[int] = None

    class Config:
        orm_mode = True
