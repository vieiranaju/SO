from fastapi import FastAPI
from app.controllers import router as pets_router

app = FastAPI(title="Petshop API")


@app.get("/", tags=["root"])
async def root():
	return {"message": "Petshop API - backend running"}


app.include_router(pets_router, prefix="/pets", tags=["pets"])

