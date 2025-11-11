from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import PetCreate, PetOut, PetUpdate

router = APIRouter()


@router.get("/", response_model=List[PetOut])
async def list_pets():
	"""Retorna lista vazia por enquanto (modelo CRUD não implementado).
	"""
	return []


@router.get("/{pet_id}", response_model=PetOut)
async def get_pet(pet_id: int):
	"""Retorna 404 por enquanto (modelo CRUD não implementado)."""
	raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet não encontrado")


@router.post("/", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_pet(payload: PetCreate):
	"""Endpoint preparado para criar um pet, mas a persistência ainda não foi implementada."""
	return {"detail": "Criação não implementada: modelo/CRUD ainda não está pronto"}


@router.put("/{pet_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def update_pet(pet_id: int, payload: PetUpdate):
	"""Atualização não implementada."""
	return {"detail": "Atualização não implementada: modelo/CRUD ainda não está pronto"}


@router.delete("/{pet_id}", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def delete_pet(pet_id: int):
	"""Deleção não implementada."""
	return {"detail": "Deleção não implementada: modelo/CRUD ainda não está pronto"}

