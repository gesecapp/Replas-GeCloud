# Checklist de Nova Feature

## 1. Estrutura de Pastas

- [ ] Criar pasta em `src/routes/_private/{feature}/`
- [ ] Criar `index.tsx` (listagem) com `createFileRoute` + `staticData`
- [ ] Criar `add/index.tsx` (formulário criar/editar)
- [ ] Criar `details.tsx` se necessário (detalhe via `search: { id }`)
- [ ] Criar `@interface/{feature}.interface.ts` (Zod schema + types)
- [ ] Criar `@hooks/use-{feature}-form.ts` (react-hook-form + zodResolver)
- [ ] Criar `@hooks/use-{feature}-api.ts` (mutations — se não for global)
- [ ] Criar `@components/{feature}-form.tsx` (usando `useFormContext` + `DefaultFormLayout`)
- [ ] Criar `@consts/{feature}.consts.ts` (se necessário)
- [ ] Criar `@utils/columns.tsx` (colunas do DataTable, se listagem)

## 2. Query de API

- [ ] Verificar se já existe em `src/query/`
- [ ] Se não, criar em `src/query/{feature}.ts` seguindo `src/query/PATTERN.md`
- [ ] Definir query keys hierárquicas (`all > lists > list > details > detail`)
- [ ] Criar fetch functions privadas com `request()` + `GET()`/`POST()`
- [ ] Criar mutation hooks com `invalidateQueries` no `onSuccess`

## 3. Hooks

- [ ] Verificar se o hook já existe em `src/hooks/` (globais)
- [ ] Verificar se o hook já existe em `src/query/` (query hooks)
- [ ] Verificar comboboxes em `src/components/data-inputs/`

## 4. Traduções

- [ ] Adicionar chaves de texto em `src/config/translations.json`
- [ ] Usar `t('chave')` de `@/lib/helpers/translate` para todos os textos do sistema

## 5. Validações de Padrão

- [ ] Listagens usam `DataTable` — **nunca** `ItemGroup`/`Item` para lista de registros
- [ ] Colunas do `DataTable` com `useMemo<DataTableColumn<TEntity>[]>`
- [ ] Loading: `<DefaultLoading />`
- [ ] Dados vazios: `<DefaultEmptyData />`
- [ ] Formulários: `<DefaultFormLayout sections={[...]} />`
- [ ] Datas formatadas com `formatDate()` de `@/lib/helpers/formatDate.utils`
- [ ] Estado persistente via Zustand `persist` — **nunca** `localStorage`
- [ ] Textos traduzidos via `t()` com chaves em `translations.json`
- [ ] Sem tags HTML estilizadas — usar componentes ShadCN
- [ ] Detalhes/edição via search params (`?id=...`) — **nunca** `$id` dinâmico
- [ ] `function` declarations — **nunca** `const Component = () =>`

## 6. Antes de Commitar

```bash
pnpm run format  # Biome formatter
pnpm run check   # TypeScript type-check
```
