# Replas-G — estado do projeto e pendências

Clone do `FBV-GeCloud` para o cliente **Replas**, criado sem histórico git para
não propagar a keystore de release do FBV (que está versionada no repo de origem).

---

## Aplicado

| Item | Valor |
|---|---|
| `appId` / bundle ID | `br.com.gecloud.replas` |
| `appName` | `Replas-G` |
| Versão | 2.19.0 — `versionCode 219`, `versionName 2.19`, `MARKETING_VERSION 2.19`, `CURRENT_PROJECT_VERSION 219` (alinhada ao FBV v2.19) |
| Pacote Java | `android/app/src/main/java/br/com/gecloud/replas/` |
| Cor da marca | `#00AEEF` — cor da logo; aplicada em `theme-color`, `theme_color` do manifest e `--primaryBlue` (`src/styles.css`) |
| Repositório | `https://github.com/gesecapp/Replas-GeCloud` |
| Domínio dos convites | `www.replas.gecloud.com.br/new-user` |

### Marca visual

**Fonte única: `public/images/logo.svg`** — o símbolo da Replas em vetor
(`#00AEEF`), sem o nome. Não há logo com texto no app; todos os pontos usam só o
símbolo:

| Onde | Arquivo | Como |
|---|---|---|
| Telas de login, cadastro, senha e header da home | `public/images/logo.svg` | `<img src="/images/logo.svg">` direto |
| Favicon | `public/images/logo.svg` + `public/favicon.ico` | `index.html`; o `.ico` (16/32/48/64px) foi rasterizado do SVG para navegadores que pedem `/favicon.ico` |
| Ícone iOS, ícones Android, ícones PWA | `assets/icon-only.svg`, `assets/logo.svg` | derivados pelo script |
| Splash iOS e Android (claro e escuro) | `assets/splash.svg`, `assets/splash-dark.svg` | derivados pelo script |
| `apple-touch-icon` | `public/icons/icon-192.webp` | gerado pelo `@capacitor/assets` |

O fundo de ícones e splash é escuro (`#0f172a`).

Removidos em 03/10/2026: `Logo.png`, `assets/{logo,icon,splash,splash-dark}.png`,
`public/images/logo.png`, `public/logo192.webp`, `public/logo512.webp` e 26
`public/icons/apple-splash-*.png` que não eram referenciados (todos traziam a
logo antiga com o nome).

### Gerar ícones e splash

```bash
pnpm run assets:generate
npx cap sync
```

`assets:generate` roda primeiro `scripts/prepare-assets.sh`, que deriva de
`public/images/logo.svg` os quatro arquivos em `assets/`. **Os arquivos de
`assets/` são gerados — para trocar a logo, substitua `public/images/logo.svg`**
(mantendo `viewBox="0 0 1000 1000" width="1000" height="1000"` e o símbolo
centrado; o script recusa outro formato).

| Arquivo | viewBox | Fundo | Uso |
|---|---|---|---|
| `assets/logo.svg` | 1440 | transparente | foreground do ícone adaptativo Android |
| `assets/icon-only.svg` | 1440 | `#0f172a` | ícone iOS, ícones Android legados, ícones PWA |
| `assets/splash.svg` / `splash-dark.svg` | 3300, rasterizado em 2732px | `#0f172a` | splash, símbolo com ~26% do lado |

Por que assim — comportamento do `@capacitor/assets` 3.0.5, lido no código:

- **Só lê `assets/`, com nomes fixos**, e tenta `.png` antes de `.svg`: um PNG
  de mesmo nome deixado em `assets/` faz o SVG ser ignorado.
- **viewBox 1440 nos ícones**: o símbolo ocupa 86% do viewBox original. No
  ícone adaptativo Android só o círculo central (~61% do canvas) aparece com
  segurança, e sem margem as pontas seriam cortadas.
- **`icon-only` com fundo**: no modo logo os ícones PWA saem transparentes, o
  que é ruim para `apple-touch-icon` e ícones `maskable`.
- **Splash explícito, não modo logo**: no modo logo o tamanho do símbolo no
  splash é uma largura absoluta em pixels, igual para todas as densidades
  Android; nas telas menores ela estoura e cai em 20% de uma fonte com margem,
  e o símbolo fica minúsculo. O `splash.svg` já traz fundo e margem, e a
  ferramenta só o recorta (cover) para cada tela.
- **Não usar o SVG cru como `splash.svg`**: ele seria esticado até a tela
  inteira, sem margem e com fundo transparente.

Validado em 03/10/2026: todas as imagens Android, iOS e os 7 ícones PWA foram
regenerados, sem `icons/` sobrando na raiz e com os paths do manifest corretos.

### Correções trazidas do FBV

- **PWA icons 404**: `icons/` estava na raiz, fora de `public/`, então não ia para
  `dist/` — os 7 ícones do manifest davam 404 em produção. Movida para `public/icons/`.
- **`start_url` / `scope`**: eram `/app`, rota que não existe (as rotas reais são `/`, `/app-auth`, `/new-access`). Agora `/`.
- **`.gitignore`**: passa a bloquear `*.jks`, `*.keystore`, `*.p12`, `*.aab`, `*.apk`, `android/.idea/` e os bundles gerados pelo `cap sync`.
- **`android/.idea/`**: removida — guardava `KEY_ALIAS` da keystore do FBV, a URL do repo de origem e paths locais.
- **Política de privacidade v2.19** (`src/routes/_public/privacy-policy/index.tsx`):
  copiada do FBV. Bilíngue com inglês por padrão e com a cláusula de proteção
  igual ou equivalente para dados faciais, exigida pela App Review da Apple.
  Na ficha do App Store Connect, preencher o campo **Privacy Policy URL**.
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

### 2. Keystore de release

Gerar a keystore da Replas e guardá-la **fora do repositório** (o `.gitignore` já
bloqueia `*.jks`). Sem ela não é possível publicar atualizações depois.

```bash
keytool -genkey -v -keystore replas.jks -keyalg RSA -keysize 2048 \
    -validity 10000 -alias replas
```

### 3. iOS — conta de publicação

`ios/App/App.xcodeproj/project.pbxproj:301,326` mantém
`DEVELOPMENT_TEAM = CJ6Y844B59` (conta Apple da Gesec). Trocar pelo Team ID da
Replas se a publicação for na conta do cliente.

### 4. Publicação

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
