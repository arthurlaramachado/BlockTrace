# BlockTrace - Digital Product Passport

Sistema MPA (Multi-Page Application) para gerenciamento de Digital Product Passports usando React, Material UI e CSS puro.

## 🚀 Características

- **Identidade Visual**: Gradiente azul-roxo tecnológico (#1565C0 → #1976D2 → #7C4DFF)
- **Tipografia**: Roboto/Inter com hierarquia semibold/regular
- **Responsividade**: Design mobile-first com breakpoints Material UI
- **Acessibilidade**: Contraste AA, navegação por teclado, ARIA labels
- **Animações**: Transições suaves com Fade e hover effects

## 📋 Funcionalidades

### Públicas
- **Busca de DPP**: Busca pública por DPP ID
- **Visualização**: Dados JSON estruturados com timeline de auditoria
- **Histórico**: Últimas 5 buscas salvas localmente

### Autenticadas (Owner)
- **Dashboard**: Lista todos os DPPs do proprietário
- **CRUD Completo**: Criar, editar, visualizar e excluir DPPs
- **Formulários Dinâmicos**: Componentes e permissões editáveis
- **Validação**: Campos obrigatórios e formatos ISO

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **UI**: Material UI v5 + Material Icons
- **Roteamento**: React Router v6
- **Estado**: Context API + localStorage
- **Estilização**: Emotion + CSS customizado
- **Dados**: DataGrid para tabelas avançadas

## 📦 Instalação

\`\`\`bash
# Clonar repositório
git clone <repo-url>
cd blocktrace

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Executar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
\`\`\`

## 🗂️ Estrutura do Projeto

\`\`\`
src/
├── components/          # Componentes reutilizáveis
│   ├── MainLayout.jsx   # Layout principal com AppBar
│   ├── SearchBar.jsx    # Busca pública de DPPs
│   ├── PassportViewer.jsx # Visualizador de DPP
│   ├── AuditTimeline.jsx  # Timeline de auditoria
│   ├── DppTable.jsx     # Tabela de DPPs (DataGrid)
│   ├── DppForm.jsx      # Formulário CRUD
│   └── ProtectedRoute.jsx # Proteção de rotas
├── contexts/            # Contextos React
│   ├── AuthContext.jsx  # Autenticação simples
│   └── SnackbarContext.jsx # Notificações globais
├── pages/              # Páginas da aplicação
│   ├── SearchPage.jsx   # Página inicial (/)
│   ├── PassportPage.jsx # Visualização pública (/passport/:id)
│   ├── LoginPage.jsx    # Login com owner_key (/login)
│   ├── DashboardPage.jsx # Dashboard proprietário (/dashboard)
│   └── Dpp*.jsx        # Páginas CRUD de DPP
├── theme.js            # Tema Material UI customizado
└── App.jsx             # Configuração de rotas
\`\`\`

## 🎨 Design System

### Paleta de Cores
- **Primária**: #1976D2 (azul tecnológico)
- **Secundária**: #7C4DFF (roxo vibrante)
- **Fundo**: #F9FAFC (cinza muito claro)
- **Texto**: #0D0D0D (preto suave)

### Componentes Customizados
- **Buttons**: Gradiente azul com hover elevation
- **Cards**: Border radius 12px, shadow suave
- **TextFields**: Border radius 8px
- **AppBar**: Gradiente horizontal azul-roxo

## 🔐 Autenticação

Sistema simples baseado em `owner_key`:
- Login salva chave no localStorage e Context
- Rotas protegidas verificam autenticação
- Logout limpa dados e redireciona

**Demo**: Use qualquer chave com 8+ caracteres para testar

## 📱 Responsividade

- **xs**: Layout coluna única
- **sm-md**: Cards lado a lado
- **Container**: maxWidth="md" para conteúdo centrado
- **DataGrid**: Responsiva com scroll horizontal

## ♿ Acessibilidade

- **Contraste**: AA compliance (4.5:1)
- **Navegação**: Tab order lógica
- **ARIA**: Labels em inputs e botões
- **Foco**: Outline customizado visível
- **Screen Readers**: Texto sr-only quando necessário

## 🎭 Animações

- **Fade**: Transições entre páginas (600ms)
- **Hover**: Elevation 1→3 em cards
- **Loading**: CircularProgress durante fetch
- **Buttons**: LoadingButton para envios

## 🧪 Scripts Disponíveis

\`\`\`bash
npm run dev        # Servidor desenvolvimento (porta 3000)
npm run build      # Build otimizada para produção
npm run preview    # Preview da build local
npm run lint       # ESLint com correções automáticas
npm run format     # Prettier para formatação
\`\`\`

## 🚀 Deploy

### Vercel (Recomendado)
\`\`\`bash
# Build automática com vercel.json configurado
vercel --prod
\`\`\`

### Outras Plataformas
\`\`\`bash
npm run build
# Upload da pasta dist/
\`\`\`

## 🔧 Configuração API

O projeto espera uma API REST com os endpoints:

\`\`\`
GET    /api/dpp/:id          # Busca pública
GET    /api/dpp?ownerKey=*   # Lista DPPs do owner
POST   /api/dpp             # Criar DPP
PUT    /api/dpp/:id          # Atualizar DPP
DELETE /api/dpp/:id          # Excluir DPP
\`\`\`

Headers de autenticação: `Authorization: Bearer {ownerKey}`

## 📄 Licença

MIT License - veja LICENSE.md para detalhes.

---

**BlockTrace** - Transformando a transparência de produtos através de Digital Product Passports 🌱
