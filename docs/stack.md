# Tech Stack

## Front-End (`FrontEnd-Architecture/`)

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Runtime | Node.js | >=24 |
| Package Manager | pnpm | >=10 |
| Framework | React | 19 |
| Bundler | Vite | 7 |
| Language | TypeScript | 5 |
| Router | TanStack Router | 1.x |
| Data Fetching | TanStack Query | 5.x |
| Table | TanStack Table | 8.x |
| State | Zustand | 5.x |
| UI Library | ShadCN UI + Radix UI | latest |
| Styling | Tailwind CSS | 4.x |
| Forms | react-hook-form + zod | 7.x / 3.x |
| Charts | Recharts | 2.x |
| Animations | GSAP + Framer Motion | 3.x / 12.x |
| Dates | date-fns (ptBR) | 4.x |
| Toast | Sonner | 2.x |
| Theme | next-themes | latest |
| Linter/Formatter | Biome | 2.x |

## Back-End (`GeCloud-BackEnd/`)

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Runtime | Node.js | >=22 |
| Framework | Express | 4.x |
| Language | TypeScript | 5.x |
| Database | MongoDB | 6.x |
| ODM | Mongoose | 8.x |
| Validation | Zod | 3.x |
| Auth | JWT + bcrypt | 9.x / 6.x |
| Storage | AWS S3 SDK | 3.x |
| Email | Nodemailer | 6.x |
| Scheduler | node-cron | 4.x |
| Metrics | Prometheus (prom-client) | 15.x |
| Testing | Jest + Supertest | latest |
| Container | Docker + Docker Compose | latest |
| Linter/Formatter | Biome | 2.x |

## Arquitetura

```
Monorepo
├── FrontEnd-Architecture/     # React SPA
│   ├── Routing      → TanStack Router (file-based, directory structure)
│   ├── Server State → TanStack Query (cache, loading, error)
│   ├── Client State → Zustand (persist middleware)
│   ├─��� Forms        → react-hook-form + zod
│   ├── UI           → ShadCN + Radix (componentes proibido HTML puro)
│   └── Styling      → Tailwind CSS 4
│
└── GeCloud-BackEnd/           # API REST
    ├── Route → Controller → Service → Repository → MongoDB
    ├── Validation   → Zod middlewares
    └── Auth         → JWT + role-based (admin, user)
```
