# 🔒 Controle de Sigilo e Permissões - xFinance

> **DOCUMENTO CRÍTICO DE SEGURANÇA**
> 
> Este documento define as regras de sigilo que DEVEM ser respeitadas em TODAS as camadas do sistema.

---

## 📋 Visão Geral

O xFinance implementa **controle de sigilo por papel de usuário** através da tabela `permi` no banco SQLite. Cada papel tem acesso apenas às colunas explicitamente autorizadas.

```
⚠️ REGRA FUNDAMENTAL: Se uma coluna não está na tabela permi para o papel,
                       ela NÃO DEVE ser retornada pelo backend NEM renderizada no frontend.
```

---

## 👥 Papéis do Sistema

| Papel | Descrição | Nível de Acesso |
|-------|-----------|-----------------|
| `admin` | Administrador | TOTAL - Vê e edita tudo |
| `BackOffice` | Operacional | PARCIAL - Workflow sem valores |
| `Inspetor` | Colaborador externo | MÍNIMO - Apenas seus dados |

---

## 📊 Matriz de Permissões (Tabela `permi`)

### Papel: `admin`

**Colunas permitidas (22):**
```
id_princ, id_contr, id_segur, id_ativi, id_user_guilty, id_user_guy,
loc, meta, obs, prazo,
dt_inspecao, dt_entregue, dt_acerto, dt_envio, dt_pago, dt_denvio, dt_dpago,
dt_guy_pago, dt_guy_dpago,
honorario, despesa, guy_honorario, guy_despesa
```

**Ações permitidas:**
- ✅ Visualizar todas as colunas
- ✅ Editar qualquer campo
- ✅ Excluir registros
- ✅ Encaminhar registros
- ✅ Marcar alertas
- ✅ Gerenciar usuários
- ✅ Acessar relatórios financeiros completos

---

### Papel: `BackOffice`

**Colunas permitidas (11):**
```
id_princ, id_contr, id_segur, id_ativi, id_user_guilty, id_user_guy,
loc, prazo,
dt_inspecao, dt_entregue, dt_envio
```

**Colunas BLOQUEADAS:**
```
❌ honorario, despesa (valores recebidos)
❌ guy_honorario, guy_despesa (valores pagos)
❌ dt_pago, dt_dpago, dt_acerto (datas de pagamento/acerto)
❌ dt_guy_pago, dt_guy_dpago (datas pagamento colaborador)
❌ meta, obs (flags e observações)
```

**Ações permitidas:**
- ✅ Visualizar colunas de workflow
- ✅ Encaminhar registros
- ❌ Excluir registros
- ❌ Ver valores financeiros
- ❌ Gerenciar usuários

---

### Papel: `Inspetor`

**Colunas permitidas (11):**
```
id_princ, id_contr, id_segur, id_ativi, id_user_guy,
loc,
dt_inspecao,
dt_guy_pago, dt_guy_dpago,
guy_honorario, guy_despesa
```

**Colunas BLOQUEADAS:**
```
❌ honorario, despesa (valores da empresa)
❌ id_user_guilty (identificação de responsável)
❌ dt_pago, dt_dpago, dt_envio, dt_denvio, dt_acerto (workflow empresa)
❌ prazo, meta, obs
❌ dt_entregue
```

**Ações permitidas:**
- ✅ Visualizar seus próprios registros (filtro `id_user_guy = user_id`)
- ✅ Ver seus honorários e despesas
- ❌ Ver valores da empresa
- ❌ Ver outros inspetores
- ❌ Excluir/encaminhar
- ❌ Qualquer ação administrativa

---

## 🎨 Grupos de Colunas (UI)

O frontend organiza colunas em grupos. O controle de visibilidade dos grupos só é habilitado para `admin`:

| Grupo | Colunas | Visível para |
|-------|---------|--------------|
| **Identificação** | player, segurado, loc, guilty, guy, meta | Todos (com restrições) |
| **Workflow** | dt_inspecao, dt_entregue, prazo | admin, BackOffice |
| **Recebíveis** | dt_acerto, dt_envio, dt_pago, honorario, dt_denvio, dt_dpago, despesa | **admin APENAS** |
| **Pagamentos** | dt_guy_pago, guy_honorario, dt_guy_dpago, guy_despesa | admin, Inspetor (próprios) |
| **Contexto** | atividade, obs | admin |

---

## 🔧 Implementação no Backend (FastAPI)

### Consulta de Permissões

```python
# backend/services/permissions.py

def fetch_permissoes_cols(papel: str) -> set[str]:
    """
    Busca colunas permitidas para um papel na tabela permi.
    
    ⚠️ CRÍTICO: Esta função DEVE ser usada antes de qualquer SELECT.
    """
    with get_connection() as conn:
        cursor = conn.execute(
            "SELECT coluna FROM permi WHERE user_papel = ?",
            (papel,)
        )
        return {row[0] for row in cursor.fetchall()}
```

### Endpoint de Inspeções

```python
# backend/routers/inspections.py

@router.get("/api/inspections")
def get_inspections(current_user: User = Depends(get_current_user)):
    papel = current_user.papel
    
    # ✅ CORRETO: Buscar apenas colunas permitidas
    colunas = fetch_permissoes_cols(papel)
    
    if not colunas:
        raise HTTPException(403, "Sem permissão para visualizar dados")
    
    # Construir SELECT apenas com colunas autorizadas
    select_cols = ", ".join(colunas)
    query = f"SELECT {select_cols} FROM princ p ..."
    
    return execute_query(query)
```

### Validação de Ações

```python
# backend/routers/actions.py

@router.delete("/api/inspections/{id}")
def delete_inspection(id: int, current_user: User = Depends(get_current_user)):
    # ✅ CORRETO: Verificar papel antes de executar ação
    if current_user.papel != "admin":
        raise HTTPException(403, "Apenas admin pode excluir registros")
    
    # Executar exclusão...
```

---

## 🎨 Implementação no Frontend (React)

### Hook de Permissões

```typescript
// hooks/use-permissions.ts

export function usePermissions() {
  const { user } = useAuth();
  
  const canViewColumn = useCallback((column: string): boolean => {
    if (!user) return false;
    const permitted = PERMITTED_COLUMNS[user.papel] ?? [];
    return permitted.includes(column);
  }, [user]);
  
  const canDelete = user?.papel === 'admin';
  const canForward = ['admin', 'BackOffice'].includes(user?.papel ?? '');
  const canManageUsers = user?.papel === 'admin';
  
  return { canViewColumn, canDelete, canForward, canManageUsers };
}
```

### Renderização Condicional de Colunas

```typescript
// components/dashboard/DataGrid.tsx

function DataGrid({ data, papel }: Props) {
  const { canViewColumn } = usePermissions();
  
  // ✅ CORRETO: Filtrar colunas no render
  const visibleColumns = useMemo(() => {
    return ALL_COLUMNS.filter(col => canViewColumn(col.field));
  }, [canViewColumn]);
  
  return (
    <Table>
      <TableHeader>
        {visibleColumns.map(col => (
          <TableHead key={col.field}>{col.header}</TableHead>
        ))}
      </TableHeader>
      {/* ... */}
    </Table>
  );
}
```

### Proteção de Componentes

```typescript
// components/dashboard/modals/PerformanceModal.tsx

function PerformanceModal() {
  const { user } = useAuth();
  
  // ✅ CORRETO: Verificar permissão antes de renderizar
  if (user?.papel !== 'admin') {
    return (
      <Modal>
        <p>Você não tem permissão para acessar este relatório.</p>
      </Modal>
    );
  }
  
  return (
    <Modal>
      {/* Conteúdo financeiro completo */}
    </Modal>
  );
}
```

---

## 🚨 Validações Obrigatórias

### Antes de Exibir Dados

1. ✅ Verificar se usuário está autenticado
2. ✅ Obter papel do usuário (`user.papel`)
3. ✅ Consultar permissões na tabela `permi`
4. ✅ Filtrar colunas retornadas pelo backend
5. ✅ Filtrar colunas renderizadas no frontend

### Antes de Executar Ações

1. ✅ Verificar papel do usuário
2. ✅ Verificar se ação é permitida para o papel
3. ✅ Logar tentativa (auditoria)
4. ✅ Retornar erro 403 se não autorizado

---

## 📝 Logs e Auditoria

```python
# ⚠️ IMPORTANTE: Não logar valores sensíveis

# ❌ INCORRETO
logger.info(f"Usuário editou honorario: {old_value} -> {new_value}")

# ✅ CORRETO
logger.info(f"Usuário {user_id} editou coluna honorario no registro {id_princ}")
```

---

## 🔄 Fluxo de Verificação

```
Requisição HTTP
      │
      ▼
┌─────────────────┐
│ Autenticação    │ ─── Não autenticado ──► 401 Unauthorized
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Obter papel     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Consultar permi │ ─── Sem permissões ──► 403 Forbidden
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filtrar dados   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Retornar JSON   │ (apenas colunas permitidas)
└─────────────────┘
```

---

## ⚠️ Violações de Sigilo

Qualquer exposição de dados de sigilo alto para papéis não autorizados é considerada **FALHA CRÍTICA DE SEGURANÇA**.

**Em caso de violação detectada:**
1. Interromper imediatamente a funcionalidade
2. Notificar o responsável
3. Revisar logs de acesso
4. Corrigir antes de qualquer deploy

---

*Última atualização: 22/12/2024*
*Baseado em: x_main/docs/SIGILO_PHASE2.md*

