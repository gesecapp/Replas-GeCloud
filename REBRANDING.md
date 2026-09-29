# Replas-G — estado do projeto e pendências

Clone do `FBV-GeCloud` para o cliente **Replas**, criado sem histórico git para
não propagar a keystore de release do FBV (que está versionada no repo de origem).

---

## Aplicado

| Item | Valor |
|---|---|
| `appId` / bundle ID | `br.com.gecloud.replas` |
| `appName` | `Replas-G` |
| Versão | 1.0.0 — `versionCode 1`, `versionName 1.0`, `MARKETING_VERSION 1.0` |
| Pacote Java | `android/app/src/main/java/br/com/gecloud/replas/` |
| Cor da marca | `#00a8e3` — `theme-color`, `theme_color` do manifest e `--primaryBlue` |
| Repositório | `https://github.com/gesecapp/Replas-GeCloud` |
| Domínio dos convites | `www.replas.gecloud.com.br/new-user` |

### Marca visual

Todos os assets foram gerados a partir de `Logo.png` (278×83).

**O fundo de ícones e splash é escuro (`#0f172a`), não branco.** A logo da Replas
tem o texto em **branco puro**: sobre fundo claro o nome "Replas" desaparece e
sobra apenas o símbolo. Por isso o `APP_COMMANDS.md` foi corrigido — ele
documentava `--iconBackgroundColor '#fff'`, herdado do FBV.

- **Ícone do app**: apenas o símbolo (49×55px na arte original, quase quadrado)
- **Splash**: logo completa centralizada
- **`public/images/logo.png`**: logo completa; é renderizada com `h-12 w-auto`, então o formato horizontal funciona

Para ampliar sem borrar, os assets foram gerados por supersampling 4× com
binarização de alpha e *snap* para as duas cores da marca — a arte é binária
(só `#ffffff` e `#00a8e3`), então isso restaura bordas duras onde uma
interpolação comum deixaria tudo desfocado.

### Correções trazidas do FBV

- **PWA icons 404**: `icons/` estava na raiz, fora de `public/`, então não ia para
  `dist/` — os 7 ícones do manifest davam 404 em produção. Movida para `public/icons/`.
- **`start_url` / `scope`**: eram `/app`, rota que não existe (as rotas reais são `/`, `/app-auth`, `/new-access`). Agora `/`.
- **`.gitignore`**: passa a bloquear `*.jks`, `*.keystore`, `*.p12`, `*.aab`, `*.apk`, `android/.idea/` e os bundles gerados pelo `cap sync`.
- **`android/.idea/`**: removida — guardava `KEY_ALIAS` da keystore do FBV, a URL do repo de origem e paths locais.
- **`pnpm run assets:generate`**: novo script. O `@capacitor/assets` recria a pasta `icons/` na raiz e reescreve os paths do manifest para `../icons/` a cada execução; o script desfaz as duas coisas, impedindo a regressão.

---

## Pendente

### 1. URL do edge da Replas

`.env` está em `http://localhost:3001`. Trocar pela URL pública (ngrok) do edge:

```bash
VITE_CORE_URL=https://<dominio-da-replas>.ngrok-free.dev
```

Precisa ser um **domínio reservado próprio**. Hoje
`aboundingly-pharmacopoeic-oneida.ngrok-free.dev` é compartilhado por
`gesec-webclient/.env`, `FBV-GeCloud/.env` e `GeCloud/.env` — reutilizá-lo faz
este app apontar para o edge do FBV.

### 2. Arte em alta resolução

`Logo.png` tem 278×83, e o símbolo dentro dela apenas 49×55. Gerar o ícone de
1024×1024 exigiu ampliar **18,6×**. A técnica de binarização deixou as bordas
nítidas, mas os círculos têm pequenas irregularidades visíveis em tamanho grande.

Para a App Store, o ideal é a logo **vetorial** (SVG, AI ou PDF) ou um PNG de pelo
menos 1024×1024. Com ela, basta rodar `pnpm run assets:generate` de novo.

Vale pedir também a **versão da logo para fundo claro** (texto em cor escura). Sem
ela, no tema light o header do app mostra só o símbolo, sem o nome da empresa.

### 3. Keystore de release

Gerar a keystore da Replas e guardá-la **fora do repositório** (o `.gitignore` já
bloqueia `*.jks`). Sem ela não é possível publicar atualizações depois.

```bash
keytool -genkey -v -keystore replas.jks -keyalg RSA -keysize 2048 \
    -validity 10000 -alias replas
```

### 4. iOS — conta de publicação

`ios/App/App.xcodeproj/project.pbxproj:301,326` mantém
`DEVELOPMENT_TEAM = CJ6Y844B59` (conta Apple da Gesec). Trocar pelo Team ID da
Replas se a publicação for na conta do cliente.

### 5. Publicação

App **novo** nas duas lojas, não atualização do FBV:

- **Google Play Console**: novo app, `br.com.gecloud.replas`, AAB assinado com a keystore nova
- **App Store Connect**: registrar o Bundle ID `br.com.gecloud.replas`, criar app novo
- Preparar: ícone 1024×1024, screenshots, descrição, URL da política de privacidade, classificação etária e declaração de coleta de dados (câmera, localização, Face ID já declaradas no `Info.plist`)

A skill `capacitor-app-store` cobre o fluxo completo.

---

## Build

```bash
pnpm install
pnpm run check && pnpm run build
npx cap sync
```

Builds nativos sem Xcode/Android Studio local:
```bash
pnpm run capgo:cred:save
pnpm run capgo:build:ios
pnpm run capgo:build:android
```

## `VITE_CORE_URL` é embutido em build time

Diferente do `gesec-webclient` — cuja imagem Docker reescreve placeholders em
runtime pelo `entrypoint.sh`, permitindo que uma imagem sirva todos os clientes —
aqui o Vite embute a URL no bundle. Trocar o edge depois exige **rebuild e
republicação nas lojas**. É por isso que cada cliente precisa do próprio fork.

Ponto único de leitura: `src/lib/api/client.ts:8`, consumido em
`src/lib/api/client.ts:115` com o sufixo `/api`.

## Textos institucionais

Por decisão do cliente, os textos da **Gesec** permanecem como estão: contato,
endereço, política de privacidade e termos em `src/routes/_public/`.
