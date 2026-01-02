# Configurações Locais de Migração

Esta pasta contém **templates e arquivos de configuração local** que **não devem ser versionados** no Git por conterem ou poderem conter credenciais sensíveis.

## 📁 Estrutura

```
.local/
├── README.md                          # Este arquivo
├── setup_fdw_server.sql.template     # Template para FDW Server (VERSIONADO)
└── setup_fdw_server.sql              # Config real com credenciais (IGNORADO)
```

## 🔒 Segurança

### Arquivos Versionados (Safe)
- `*.template` - Templates sem credenciais reais
- `README.md` - Documentação

### Arquivos NÃO Versionados (Credenciais)
- `*.sql` - Configurações com credenciais reais
- `*.env` - Variáveis de ambiente
- `*.json` - Configurações locais

**Regra do `.gitignore`**:
```gitignore
supabase/migrations/.local/*.sql
!supabase/migrations/.local/*.template
```

## 🛠️ Como Usar

### 1. Copiar Template

```bash
cp supabase/migrations/.local/setup_fdw_server.sql.template \
   supabase/migrations/.local/setup_fdw_server.sql
```

### 2. Obter Credenciais

**Opção A - Supabase Dashboard:**
1. Acesse: `Settings > Vault`
2. Copie `Access Key ID` e `Secret Access Key`

**Opção B - Supabase CLI:**
```bash
supabase secrets list
```

### 3. Editar Arquivo Real

Abra `setup_fdw_server.sql` e substitua:
```sql
"vault_access_key_id" '<SEU_VAULT_ACCESS_KEY_ID>'
"vault_secret_access_key" '<SEU_VAULT_SECRET_ACCESS_KEY>'
```

Pelas credenciais reais obtidas no Passo 2.

### 4. Aplicar no Banco

**Opção A - Dashboard SQL Editor:**
```sql
-- Cole o conteúdo de setup_fdw_server.sql
-- Execute
```

**Opção B - Supabase CLI:**
```bash
supabase db execute --file supabase/migrations/.local/setup_fdw_server.sql
```

### 5. Validar

Execute no SQL Editor:
```sql
SELECT * FROM pg_foreign_data_wrapper WHERE fdwname = 'dataro_it_fdw';
SELECT * FROM pg_foreign_server WHERE srvname = 'dataro_it_fdw_server';
```

## 🌍 Multi-Ambiente

### Development
```bash
# Usar credenciais de desenvolvimento
# Aplicar via CLI local
supabase db execute --file supabase/migrations/.local/setup_fdw_server.sql
```

### Staging
```bash
# Usar credenciais de staging
# Aplicar via Dashboard ou CLI remoto
supabase db execute --file supabase/migrations/.local/setup_fdw_server.sql \
  --project-ref <staging-project-ref>
```

### Production
```bash
# Usar credenciais de produção
# Aplicar via Dashboard (mais seguro)
# Validar em staging antes de aplicar em prod
```

## ⚠️ Avisos Importantes

### ✅ FAZER

- ✅ Manter templates (`.template`) versionados
- ✅ Usar credenciais diferentes por ambiente
- ✅ Rotacionar credenciais periodicamente
- ✅ Documentar processo em docs/FDW_SETUP.md
- ✅ Validar após aplicar

### ❌ NUNCA FAZER

- ❌ Commitar arquivos `*.sql` com credenciais
- ❌ Compartilhar credenciais em chat/email
- ❌ Usar mesmas credenciais em dev/staging/prod
- ❌ Expor credenciais em logs ou screenshots
- ❌ Remover regras do `.gitignore`

## 🔄 Rotação de Credenciais

Se credenciais foram expostas:

1. **Gerar novas credenciais** via Supabase Dashboard
2. **Atualizar FDW Server:**
   ```sql
   ALTER SERVER dataro_it_fdw_server OPTIONS (
     SET vault_access_key_id '<NOVA_CHAVE>',
     SET vault_secret_access_key '<NOVO_SECRET>'
   );
   ```
3. **Invalidar credenciais antigas** via Dashboard
4. **Testar** conexão após rotação

## 📚 Referências

- [Documentação FDW](../../../docs/FDW_SETUP.md)
- [Supabase Wrappers](https://supabase.com/docs/guides/database/extensions/wrappers)
- [S3 Vectors FDW](https://github.com/supabase/wrappers/tree/main/wrappers/src/fdw/s3_vectors_fdw)
- [Supabase Vault](https://supabase.com/docs/guides/database/vault)

## 🆘 Troubleshooting

### Erro: "permission denied for foreign-data wrapper"
```sql
GRANT USAGE ON FOREIGN DATA WRAPPER dataro_it_fdw TO postgres;
```

### Erro: "invalid vault credentials"
- Verificar se credenciais estão corretas
- Rotacionar credenciais via Dashboard
- Verificar se Vault está habilitado no projeto

### Erro: "server already exists"
```sql
-- Remover e recriar
DROP SERVER IF EXISTS dataro_it_fdw_server CASCADE;
-- Então execute novamente a criação
```

---

**Mantenha a segurança sempre em primeiro lugar! 🔐**
