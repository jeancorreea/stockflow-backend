StockFlow — Backend
API REST desenvolvida em NestJS para o módulo StockFlow, integrado a um sistema de autenticação centralizado via SSO.
---
 Stack
Node.js + TypeScript
NestJS 11
TypeORM + PostgreSQL
Axios
Docker
---
 Variáveis de Ambiente
Copie o arquivo `.env.example` e renomeie para `.env`:
```bash
cp .env.example .env
```
Variável	Descrição	Exemplo
`PORT`	Porta do servidor	`3000`
`CORE_URL`	URL do backend do CORE	`http://localhost:3002`
`DB_HOST`	Host do PostgreSQL	`localhost`
`DB_PORT`	Porta do PostgreSQL	`5432`
`DB_USER`	Usuário do banco	`postgres`
`DB_PASS`	Senha do banco	`postgres`
`DB_NAME`	Nome do banco	`stockflow`
`WMS_BASE_URL`	URL do sistema WMS System	`https://wms.example.com`
`WMS_MOCK`	Ativa mock do WMS System	`true`
`SMART_STORAGE_BASE_URL`	URL base do Smart Storage	`https://smart-storage.example.com`
---
 Como Rodar Localmente
Pré-requisitos
Node.js 18+
PostgreSQL rodando localmente
CORE backend rodando (necessário para autenticação)
Instalação
```bash
npm install
```
Desenvolvimento
```bash
npm run start:dev
```
A API estará disponível em `http://localhost:3000`.
Produção
```bash
npm run build
npm run start:prod
```
---
 Docker
```bash
docker-compose up --build -d
```
---
 Autenticação
Todos os endpoints (exceto `/logimat/callback`) são protegidos por autenticação via CORE.
O fluxo funciona assim:
O usuário faz login no CORE
O CORE gera um JWT e armazena em cookie (`@nucleo_token`)
O frontend do StockFlow lê o cookie e envia o token no header:
```
   Authorization: Bearer <token>
   ```
O backend valida o token chamando o CORE:
```
   GET {CORE_URL}/api/auth?token=<token>
   ```
Se válido, a requisição é processada normalmente
---
 Endpoints
Geral
Método	Rota	Descrição	Auth
`GET`	`/feature`	Lista features do módulo	❌
`GET`	`/modules`	Lista módulos em memória	
`POST`	`/modules`	Cria módulo em memória	
Smart Storage
Método	Rota	Descrição	Auth
`GET`	`/smart-storage`	Lista todas as ordens	
`GET`	`/smart-storage/status-summary`	Agrupa ordens por status	
`GET`	`/smart-storage/:id`	Busca ordem por ID	
`POST`	`/smart-storage/storage`	Cria ordem e envia ao WMS System	
`POST`	`/smart-storage/callback`	Recebe retorno do WMS System	❌
Analytics
Método	Rota	Descrição	Auth
`GET`	`/smart-storage/analytics/aging`	Análise de aging	
`GET`	`/smart-storage/analytics/abc`	Curva ABC	
`GET`	`/smart-storage/analytics/pareto`	Análise de Pareto	
`GET`	`/smart-storage/analytics/productivity`	Produtividade	
`GET`	`/smart-storage/analytics/patterns`	Padrões	
`GET`	`/smart-storage/analytics/forecast`	Previsão	
`GET`	`/smart-storage/analytics/timeline`	Timeline	
`GET`	`/smart-storage/analytics/status-timeline`	Timeline por status	
ABC
Método	Rota	Descrição	Auth
`POST`	`/abc`	Calcula curva ABC	
WMS
Método	Rota	Descrição	Auth
`GET`	`/wms/stock`	Consulta estoque WMS	
---
🔌 Integração com o CORE
Para que o CORE reconheça este módulo, o endpoint `/feature` deve retornar:
```json
[
  { "name": "STOCKFLOW_VIEW",   "pretty_name": "Visualizar", "description": "Allows viewing items" },
  { "name": "STOCKFLOW_CREATE", "pretty_name": "Criar",      "description": "Allows creating items" },
  { "name": "STOCKFLOW_UPDATE", "pretty_name": "Atualizar",  "description": "Allows updating items" },
  { "name": "STOCKFLOW_DELETE", "pretty_name": "Deletar",    "description": "Allows deleting items" }
]
```
O administrador do CORE deve cadastrar o módulo via `POST /modules/new/` informando:
`urlBack`: URL deste backend
`urlFront`: URL do frontend do StockFlow
---
 Estrutura Principal
```
src/
├── common/
│   ├── middleware/auth.middleware.ts  # Autenticação via CORE
│   ├── interceptors/                 # Response wrapper
│   ├── filters/                      # Error handler
│   └── constants.ts                  # NAME_MODULE, ISSUER
├── modules/                          # Módulo em memória
├── feature/                          # Endpoint /feature
├── inventory/abc/                    # Cálculo ABC
├── integrations/
│   ├── logimat/                      # Integração Smart Storage/WMS System
│   └── wms/                          # Integração WMS
└── app.module.ts
```
