from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(128), nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    telefone = Column(String(32), nullable=True)

    pets = relationship("Pet", back_populates="dono", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Cliente id={self.id} nome={self.nome} email={self.email}>"


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(128), nullable=False)
    especie = Column(String(64), nullable=True)
    raca = Column(String(64), nullable=True)
    idade = Column(Integer, nullable=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)

    dono = relationship("Cliente", back_populates="pets")

    def __repr__(self):
        return f"<Pet id={self.id} nome={self.nome} especie={self.especie} dono={self.cliente_id}>"
