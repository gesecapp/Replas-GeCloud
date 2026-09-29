# Referência do Back-End

Back-end do Replas-G. Node.js + Express + MongoDB + Mongoose + Zod + Biome.

## Rotas Disponíveis

Registradas em `src/index.ts`:

| Prefixo | Módulo | Operações |
|---------|--------|-----------|
| `/auth` | Autenticação | signup, signin, logout, refresh token |
| `/user` | Usuários | CRUD + convite + permissões |
| `/invite` | Convites | Envio e gestão de convites |
| `/role` | Perfis/Roles | Gestão de perfis de acesso |
| `/s3` | Upload | Upload de arquivos via AWS S3 |

## Padrão de Endpoints CRUD

```
GET    /{module}          → Lista todos (com filtros opcionais via query)
GET    /{module}/partial   → Lista resumida (para selects/comboboxes — retorna ID + campos mínimos)
GET    /{module}/:id       → Detalhe completo
POST   /{module}           → Criar
PUT    /{module}/:id       → Atualizar
PATCH  /{module}/:id/status → Atualizar status
DELETE /{module}/:id       → Deletar (admin only)
```

### Rotas `/partial`

As rotas `partial` retornam dados resumidos para preencher comboboxes e selects. Trazem o ID do registro para permitir busca completa posterior quando o usuário seleciona um item.

## Resposta Padrão da API

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

No front, acessar via:
```tsx
const res = await request('patient', GET());
if (!res.success) throw new Error(res.message);
return res.data as Patient[];
```

## Arquitetura em Camadas

```
Request → Router → Middleware (Zod validation) → Controller → Service → Repository → MongoDB
```

- **Routers** (`src/routers/`): Definem endpoints e cadeia de middlewares
- **Controllers** (`src/controllers/`): Camada HTTP fina, chama services
- **Services** (`src/services/`): Lógica de negócio
- **Services Shared** (`src/services/shared/`): Lógica cross-domain (services nunca importam outros services diretamente)
- **Repositories** (`src/repositories/`): Acesso a dados (único lugar que toca Mongoose)
- **Use-Cases** (`src/use-cases/`): Orquestrações complexas multi-serviço (ex: criar paciente + agendamento)
- **Events** (`src/events/`): Sistema de eventos de domínio (financial, reminder, birthday)

## Middlewares de Autorização

```
validToken → [isAdmin | isUser]
```

- `isUser`: Acesso leitura/escrita
- `isAdmin`: Acesso total (apenas admin)

## Módulos do Back-End

Cada módulo segue a mesma estrutura:
- `src/routers/{module}.route.ts` — Rotas
- `src/controllers/{module}.controller.ts` — Handlers HTTP
- `src/services/{module}.service.ts` — Lógica de negócio
- `src/repositories/{module}.repository.ts` — Acesso a dados
- `src/database/{module}.database.ts` — Schema Mongoose
- `src/schemas/{module}.schema.ts` — Validação Zod

## Tipos Principais

| Tipo | Descrição |
|------|-----------|
| `User` / `PartialUser` / `FullUser` | Usuário do sistema |
| `Invite` | Convite de acesso |
| `Role` | Perfil de acesso |
| `AuthUser` | Contexto do usuário autenticado |
