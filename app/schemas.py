from pydantic import BaseModel, EmailStr
from typing import Optional, List


class ClienteBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class PetBase(BaseModel):
    nome: str
    especie: Optional[str] = None
    raca: Optional[str] = None
    idade: Optional[int] = None
    cliente_id: int


class PetCreate(PetBase):
    pass


class PetRead(PetBase):
    id: int

    class Config:
        orm_mode = True


class ClienteRead(ClienteBase):
    id: int
    pets: List[PetRead] = []

    class Config:
        orm_mode = True
