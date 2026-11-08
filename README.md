# NutriForte — Frontend MVP

React 18 + Vite + TypeScript + React Router 6 + Axios.

CSS próprio (tokens) + Tailwind como utilitário.

## Pré-requisitos

- Node.js 20+
- Backend local na porta 8037 (desenvolvimento) ou URL pública da API (produção)

## Executar

```bash
cd NutriForte_FrontEnd
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:3074` ou `http://<ip-da-maquina>:3074`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm test` | Testes Vitest |
| `npm run lint` | ESLint |

## Variáveis

```text
VITE_API_BASE_URL=
```

Vazio (padrão): as requisições vão para `/api` no mesmo host; no `npm run dev` o proxy do Vite encaminha para
`http://127.0.0.1:8037`. Para produção, defina a URL pública (ex.: `https://apinutri.caluan.com.br`) no build.
O código não usa mais a URL de produção como padrão.

Sem secrets no código.

## Perfis

| Role | Entrada |
|------|---------|
| ADMIN | `/admin` |
| NUTRITIONIST | `/nutritionist` |
| PATIENT | `/patient` |

Cadastro público de paciente: `/register`. Nutricionistas são criados pelo ADMIN.

## Usuários padrão (profile `dev`)

Ao subir o backend com `SPRING_PROFILES_ACTIVE=dev`, são criados (se ainda não existirem):

| Perfil | E-mail | Senha |
|--------|--------|-------|
| ADMIN | `admin@nutriforte.local` | `NutriForte1` |
| NUTRITIONIST | `nutri@nutriforte.local` | `NutriForte1` |

Somente para demonstração local. Não use em produção.

## Avaliação nutricional

| Perfil | Rota |
|--------|------|
| PATIENT | `/patient/assessment` — usa `POST /api/v1/nutrition/calculate` |
| NUTRITIONIST | `/nutritionist/patients/:id/assessment` — usa `POST /api/v1/nutritionist/patients/{id}/nutrition/calculate` |

Nenhum valor da planilha da Clínica é hardcoded. Badges: backend / pendente / indisponível.

## Documentação

Ver `docs/sprints/Sprint-17-FrontendMVP.md`.
