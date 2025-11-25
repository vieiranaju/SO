# Sistema de Gerenciamento de Petshop

Projeto acadêmico para as disciplinas de Programação Web e Sistemas Operacionais.

O objetivo é construir uma aplicação web CRUD (Create, Read, Update, Delete) utilizando Docker para gerenciar o ambiente de execução.

## Tecnologias Utilizadas

* **Frontend:** React
* **Backend (API):** Node.js/Express
* **Banco de Dados:** PostgreSQL
* **Ambiente (SO):** Docker e Docker Compose

---

## Funcionalidades Principais (CRUD)

O sistema implementa as quatro operações CRUD para as seguintes entidades:

* **Pets:** Cadastro, visualização, edição e remoção.
* **Agendamentos:** Gerenciamento de serviços (ex: banho, tosa).
* **Vacinas:** Registro e consulta do histórico de vacinas.

---

## Requisitos Atendidos

### 1. Programação Web (Full Stack)

* **Frontend:** Interface web que consome a API.
* **Backend:** API RESTful que se conecta ao banco de dados.
* **Banco de Dados:** Sistema para persistência dos dados.

### 2. Sistemas Operacionais (Contêineres)

O projeto utiliza **Docker** e **Docker Compose** (Opção 1 do requisito).

A arquitetura é definida no arquivo `docker-compose.yml`, onde cada serviço (Frontend, Backend e Banco de Dados) é executado em um contêiner isolado.

---

## Como Executar o Projeto

**Pré-requisitos:**
* Git
* Docker
* Docker Compose

**Passos:**

1.  Clone este repositório:
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_GIT]
    ```

2.  Navegue até a pasta raiz do projeto:
    ```bash
    cd [NOME_DA_PASTA_DO_PROJETO]
    ```

3.  (Opcional) Configure as variáveis de ambiente (ex: crie um arquivo `.env`).

4.  Suba os contêineres:
    ```bash
# Sistema de Gerenciamento de Petshop

Projeto acadêmico para as disciplinas de Programação Web e Sistemas Operacionais.

O objetivo é construir uma aplicação web CRUD (Create, Read, Update, Delete) utilizando Docker para gerenciar o ambiente de execução.

## Tecnologias Utilizadas

* **Frontend:** React
* **Backend (API):** Node.js/Express
* **Banco de Dados:** PostgreSQL
* **Ambiente (SO):** Docker e Docker Compose

---

## Funcionalidades Principais (CRUD)

O sistema implementa as quatro operações CRUD para as seguintes entidades:

* **Pets:** Cadastro, visualização, edição e remoção.
* **Agendamentos:** Gerenciamento de serviços (ex: banho, tosa).
* **Vacinas:** Registro e consulta do histórico de vacinas.

---

## Requisitos Atendidos

### 1. Programação Web (Full Stack)

* **Frontend:** Interface web que consome a API.
* **Backend:** API RESTful que se conecta ao banco de dados.
* **Banco de Dados:** Sistema para persistência dos dados.

### 2. Sistemas Operacionais (Contêineres)

O projeto utiliza **Docker** e **Docker Compose** (Opção 1 do requisito).

A arquitetura é definida no arquivo `docker-compose.yml`, onde cada serviço (Frontend, Backend e Banco de Dados) é executado em um contêiner isolado.

---

## Como Executar o Projeto

**Pré-requisitos:**
* Git
* Docker
* Docker Compose

**Passos:**

1.  Clone este repositório:
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_GIT]
    ```

2.  Navegue até a pasta raiz do projeto:
    ```bash
    cd [NOME_DA_PASTA_DO_PROJETO]
    ```

3.  (Opcional) Configure as variáveis de ambiente (ex: crie um arquivo `.env`).

4.  Suba os contêineres:
    ```bash
    docker-compose up -d --build
    ```
    * O comando `-d` executa em segundo plano.
    * O `--build` força a reconstrução das imagens.

5.  Acesse a aplicação:
    * **Frontend:** `http://localhost:5173`
    * **Backend (API):** `http://localhost:8080`