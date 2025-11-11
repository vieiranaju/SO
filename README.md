# Backend (FastAPI) for Alunos

Este backend fornece endpoints para criar e listar alunos, usando FastAPI + SQLAlchemy e PostgreSQL.

Pré-requisitos:
- Docker (para rodar o PostgreSQL)
- Python 3.9+

1) Banco de dados (se já tem container)

Se você já tem um container PostgreSQL rodando com as credenciais abaixo, basta ajustar a variável de ambiente `DATABASE_URL` ou copiar `.env.example` para `.env`:

- Host: localhost
- Porta: 5432
- Usuário: docker
- Senha: dockerpass
- Banco: petshop_db

`DATABASE_URL` correspondente:

```
postgresql://docker:dockerpass@localhost:5432/petshop_db
```

Se você quiser criar um container novo (exemplo genérico):

```powershell
docker run -d -p 5432:5432 -e POSTGRES_USER=docker -e POSTGRES_PASSWORD=dockerpass -e POSTGRES_DB=petshop_db --name petshop-postgres postgres
```

3) Instalar dependências e rodar

```powershell
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Endpoints principais:
- GET /alunos -> lista alunos
- POST /alunos -> cria um aluno (JSON: nome, email, idade)

4) Usando Docker Compose (Postgres + app)

Se preferir iniciar o banco e o backend com o Docker Compose, há um `docker-compose.yml` no repositório. Ele sobe um serviço `db` (Postgres) e um serviço `web` que builda a imagem do app e expõe a API em 8000.

```powershell
docker compose up --build -d
# Ver logs: docker compose logs -f web
```

Para parar e remover recursos:

```powershell
docker compose down -v
```

Observações:
- Certifique-se de que o container PostgreSQL esteja rodando antes de iniciar o FastAPI.
- O código cria as tabelas automaticamente (chama `Base.metadata.create_all`).
