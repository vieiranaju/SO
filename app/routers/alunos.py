from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import SessionLocal, init_db

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.on_event("startup")
def on_startup():
    # Ensure tables exist
    init_db()


@router.get("/clientes", response_model=List[schemas.ClienteRead])
def read_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_clientes(db, skip=skip, limit=limit)


@router.post("/clientes", response_model=schemas.ClienteRead, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Cliente).filter(models.Cliente.email == cliente.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_cliente(db, cliente)


@router.get("/pets", response_model=List[schemas.PetRead])
def read_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_pets(db, skip=skip, limit=limit)


@router.post("/pets", response_model=schemas.PetRead, status_code=status.HTTP_201_CREATED)
def create_pet(pet: schemas.PetCreate, db: Session = Depends(get_db)):
    # verify owner exists
    owner = crud.get_cliente(db, pet.cliente_id)
    if not owner:
        raise HTTPException(status_code=400, detail="Cliente (owner) não encontrado")
    return crud.create_pet(db, pet)
