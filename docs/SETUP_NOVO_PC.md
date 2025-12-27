# 🖥️ Configuração do Ambiente de Desenvolvimento - Novo PC

> Guia para configurar o xFinance 3.0 em uma nova máquina de desenvolvimento

---

## 📋 Pré-requisitos

Instale os seguintes softwares antes de prosseguir:

| Software | Versão Mínima | Download |
|----------|---------------|----------|
| **Node.js** | 18.x | https://nodejs.org/ |
| **Python** | 3.10+ | https://python.org/ |
| **Git** | Qualquer | https://git-scm.com/ |
| **PowerShell** | 7.x (recomendado) | https://github.com/PowerShell/PowerShell |

### Verificar Instalações

```powershell
node -v       # Deve mostrar v18.x ou superior
python --version  # Deve mostrar 3.10+
git --version
pwsh --version    # PowerShell 7 (opcional mas recomendado)
```

---

## 📦 Passo 1: Clonar o Repositório

```powershell
git clone https://github.com/SEU_USUARIO/x_finan.git
cd x_finan
```

---

## ⚙️ Passo 2: Configurar Variável de Ambiente

O sistema precisa saber onde está o banco de dados SQLite.

> 📁 **Estrutura:** O banco está sempre em `../x_db/xFinanceDB.db` (um nível acima do repositório)

### Opção A: Variável Permanente (Recomendado)

1. Pressione `Win + R`, digite `sysdm.cpl` e pressione Enter
2. Vá para a aba **Avançado**
3. Clique em **Variáveis de Ambiente**
4. Em **Variáveis do Sistema**, clique em **Novo**
5. Preencha:
   - **Nome:** `XF_BASE_DIR`
   - **Valor:** Caminho do diretório **pai** (que contém `x_db` e `x_finan`)
   - **Exemplo:** `E:\MVRX\Financeiro\xFinance_3.0`
6. Clique **OK** em todas as janelas
7. **Reinicie o terminal** para aplicar

### Opção B: Variável Temporária (Por Sessão)

```powershell
# Aponta para o diretório pai do repositório
$env:XF_BASE_DIR = "E:\MVRX\Financeiro\xFinance_3.0"
```

> ⚠️ Esta opção precisa ser executada toda vez que abrir um novo terminal

---

## 📁 Passo 3: Verificar Banco de Dados

O banco SQLite deve estar **um nível acima** do repositório:

```
[XF_BASE_DIR]\
├── x_db\
│   └── xFinanceDB.db    ← Banco de dados
└── x_finan\             ← Repositório (você está aqui)
```

Verifique se o arquivo existe:

```powershell
Test-Path "$env:XF_BASE_DIR\x_db\xFinanceDB.db"
# Deve retornar: True

# Ou, de dentro do repositório:
Test-Path "..\x_db\xFinanceDB.db"
# Deve retornar: True
```

---

## 🔧 Passo 4: Instalar Dependências do Frontend

Na raiz do projeto:

```powershell
cd x_finan
npm install
```

Aguarde a instalação de todas as dependências Node.js.

---

## 🐍 Passo 5: Configurar Ambiente Python (Backend)

```powershell
cd backend

# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual
.\.venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt
```

> 💡 Se receber erro de execução de scripts, execute:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## 🚀 Passo 6: Executar o Sistema

### Opção A: Script Automatizado (Recomendado)

```powershell
.\scripts\start_dev.ps1
```

### Opção B: Manual (Dois Terminais)

**Terminal 1 - Backend:**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```powershell
cd x_finan
npm run dev
```

---

## 🌐 Acessar o Sistema

Abra o navegador em:

```
http://localhost:5000
```

---

## ✅ Checklist Final

- [ ] Node.js 18+ instalado
- [ ] Python 3.10+ instalado
- [ ] Git instalado
- [ ] Repositório clonado em `[XF_BASE_DIR]\x_finan\`
- [ ] `XF_BASE_DIR` aponta para o diretório **pai** (que contém `x_db` e `x_finan`)
- [ ] Banco de dados existe em `[XF_BASE_DIR]\x_db\xFinanceDB.db`
- [ ] `npm install` executado (raiz do projeto)
- [ ] `.venv` criado na pasta `backend`
- [ ] `pip install -r requirements.txt` executado
- [ ] Sistema acessível em `http://localhost:5000`

---

## 🔧 Solução de Problemas

### Erro: "XF_BASE_DIR não definido"

```powershell
# Verificar se está definido
echo $env:XF_BASE_DIR

# Se vazio, definir manualmente
$env:XF_BASE_DIR = "E:\MVRX\Financeiro\xFinance_3.0"
```

### Erro: "Scripts desabilitados"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Porta 5000 ou 8000 em uso"

```powershell
# Verificar processos nas portas
netstat -ano | findstr ":5000 :8000"

# Encerrar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

### Erro: "Banco de dados não encontrado"

1. Verifique se `XF_BASE_DIR` aponta para o diretório **pai** do repositório
2. O banco deve estar em `$XF_BASE_DIR\x_db\xFinanceDB.db` (ou `../x_db/` relativo ao repo)
3. Verifique se a unidade está montada corretamente
4. Se for disco de rede, verifique a conexão

```powershell
# Verificar estrutura
ls $env:XF_BASE_DIR
# Deve mostrar: x_db  x_finan

ls "$env:XF_BASE_DIR\x_db"
# Deve mostrar: xFinanceDB.db
```

---

## 📂 Estrutura de Diretórios

```
[XF_BASE_DIR]\                      ← Variável de ambiente aponta aqui
│
├── x_db\                           ← Banco de dados (FORA do repositório)
│   └── xFinanceDB.db               ← SQLite
│
└── x_finan\                        ← Repositório Git
    ├── backend\
    │   ├── .venv\                  ← Ambiente virtual Python (criar localmente)
    │   ├── requirements.txt
    │   └── main.py
    ├── client\                     ← Frontend React
    ├── server\                     ← Express Proxy
    ├── docs\                       ← Documentação
    ├── scripts\                    ← Scripts de desenvolvimento
    ├── node_modules\               ← Dependências Node (criar localmente)
    └── package.json
```

> 💡 O banco `x_db/` está **fora** do repositório Git, um nível acima.
> Isso permite manter dados separados do código-fonte.

---

## 🔄 Sincronização com Git

### Puxar últimas alterações

```powershell
git pull origin main
```

### Enviar alterações

```powershell
git add .
git commit -m "Descrição das alterações"
git push origin main
```

---

*Última atualização: 25/12/2024*
*Projeto: xFinance 3.0 - Migração React + FastAPI*

