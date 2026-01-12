# 🏢 Sistema de Agendamento de Salas de Reunião

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</p>

Sistema completo para gerenciamento de agendamentos de salas de reunião, desenvolvido com NestJS (backend) e React + TypeScript (frontend).

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Modelagem de Dados](#modelagem-de-dados)
- [Executando o Projeto](#executando-o-projeto)
- [Testes](#testes)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **pnpm** (gerenciador de pacotes) - `npm install -g pnpm`
- **Docker** e **Docker Compose** (para o banco de dados)

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/daviramosds/Daccta-Challenge.git
cd desafio-daccta
```

### 2. Instale as dependências

**Backend:**
```bash
cd backend
pnpm install
```

**Frontend:**
```bash
cd frontend
pnpm install
```

## 🗄️ Configuração do Banco de Dados

### 1. Inicie os containers PostgreSQL

Na raiz do projeto, execute:

```bash
docker-compose up -d
```

Isso iniciará dois bancos PostgreSQL:
- **postgres** (porta 5432) - Banco de desenvolvimento
- **postgres_test** (porta 5433) - Banco de testes

### 2. Verifique se os containers estão rodando

```bash
docker ps
```

Você deve ver dois containers:
- `desafio-daccta-db`
- `desafio-daccta-db-test`

### 3. Configuração das variáveis de ambiente

O backend já está configurado com os arquivos `.env` e `.env.test`:

**Backend (`backend/.env`):**
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio_daccta
```

**Testes (`backend/.env.test`):**
```env
PORT=3000
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio_daccta_test
```

> **Nota:** As tabelas serão criadas automaticamente pelo TypeORM com `synchronize: true` em desenvolvimento e testes.

## �️ Modelagem de Dados

### Diagrama ER

```mermaid
erDiagram
    ROOMS ||--o{ BOOKINGS : "possui"
    
    ROOMS {
        uuid id PK
        varchar name UK "Nome da sala (único)"
        integer capacity "Capacidade"
        timestamp created_at "Data de criação"
    }
    
    BOOKINGS {
        uuid id PK
        uuid room_id FK "Referência à sala"
        date date "Data do agendamento"
        time start_time "Horário de início"
        time end_time "Horário de término"
        varchar title "Título/Descrição"
        timestamp created_at "Data de criação"
    }
```

### Entidades

#### **Room** (Salas)

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK | Identificador único |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Nome da sala |
| `capacity` | INTEGER | NOT NULL, > 0 | Capacidade da sala |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Regras de Negócio:**
- Nome deve ser único
- Capacidade deve ser maior que zero
- Não pode ser excluída se houver agendamentos futuros

#### **Booking** (Agendamentos)

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK | Identificador único |
| `room_id` | UUID | FK, NOT NULL | ID da sala |
| `date` | DATE | NOT NULL | Data do agendamento |
| `start_time` | TIME | NOT NULL | Horário de início |
| `end_time` | TIME | NOT NULL | Horário de término |
| `title` | VARCHAR(200) | NOT NULL | Título do agendamento |
| `created_at` | TIMESTAMP | NOT NULL | Data de criação |

**Relacionamentos:**
- `room_id` → `rooms(id)` com `ON DELETE RESTRICT`

**Regras de Negócio:**
- Sala deve existir (`room_id` válido)
- `end_time` deve ser maior que `start_time`
- Não permite agendamentos no passado
- Não permite sobreposição de horários na mesma sala/dia
- Permite mesmo horário em salas diferentes

## 🚀 Executando o Projeto

### Backend (NestJS)

```bash
cd backend
pnpm start:dev
```

O servidor estará disponível em: `http://localhost:3000`

**📚 Documentação Swagger/OpenAPI:** `http://localhost:3000/api/docs`

### Frontend (React + Vite)

Em outro terminal:

```bash
cd frontend
pnpm dev
```

A aplicação estará disponível em: `http://localhost:5173`

## 🧪 Testes

### Testes E2E (Backend)

```bash
cd backend
pnpm test:e2e
```

**Resultado esperado:**
```
Test Suites: 3 passed, 3 total
Tests:       22 passed, 22 total
```

Os testes cobrem:
- ✅ Validação de dados
- ✅ Detecção de conflitos de horários
- ✅ Regras de negócio (passado, sobreposição, etc.)
- ✅ Filtros e ordenação

## 🎯 Funcionalidades

### Salas

- ✅ Listagem de salas
- ✅ Criação de salas
- ✅ Exclusão de salas (com validação de agendamentos futuros)
- ✅ Validação de nome único
- ✅ Validação de capacidade

### Agendamentos

- ✅ Criar agendamento vinculado a sala
- ✅ Editar agendamento existente
- ✅ Excluir agendamento
- ✅ Validações:
  - Horário de término > horário de início
  - Não permite agendamentos no passado
  - Detecta conflitos de horário na mesma sala/dia
  - Permite mesmo horário em salas diferentes
- ✅ Filtros:
  - Por data única
  - Por período (range de datas)
- ✅ Ordenação cronológica automática
- ✅ Indicação quando não há agendamentos

### Interface

- ✅ Dark mode automático
- ✅ Animações e transições suaves  
- ✅ Design responsivo
- ✅ Feedback visual com toasts
- ✅ Confirmação antes de excluir

## 📁 Estrutura do Projeto

```
desafio-daccta/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── bookings/       # Módulo de agendamentos
│   │   ├── rooms/          # Módulo de salas
│   │   └── app.module.ts   # Módulo principal
│   ├── test/               # Testes E2E
│   └── package.json
│
├── frontend/               # App React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── package.json
│
└── docker-compose.yaml     # Configuração PostgreSQL
```

## 🛠 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **class-validator** - Validação de DTOs
- **Jest** - Testes E2E

### Frontend
- **React** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Sonner** - Toast notifications
- **Lucide React** - Ícones
- **TailwindCSS** - Estilização

## 📝 Scripts Úteis

### Backend
```bash
pnpm start:dev      # Modo desenvolvimento com watch
pnpm build          # Build para produção
pnpm test:e2e       # Executar testes E2E
pnpm lint           # Verificar código (ESLint)
```

### Frontend
```bash
pnpm dev            # Servidor de desenvolvimento
pnpm build          # Build para produção
pnpm preview        # Preview do build de produção
```

## 🔗 Links

- **Repositório:** https://github.com/daviramosds/Daccta-Challenge
- **Frontend:** http://localhost:5173 (após iniciar o frontend)
- **API Backend:** http://localhost:3000 (após iniciar o backend)
- **Swagger Docs:** http://localhost:3000/api/docs (documentação interativa da API)

## 👨‍💻 Autor

Desenvolvido como parte do desafio técnico Daccta.