### Faça build

pnpm run build

### Atualize a versão

[Android](./android/app/build.gradle)

[iOS](./ios/App/App.xcodeproj/project.pbxproj)

[Package.json](./package.json)

Confira o ID do app em:

[capacitor.config](./capacitor.config.ts)

appId: 'br.com.gecloud.replas',

> Apple e Android

### Syncronize com o Capacitor

npx cap sync

### Abra o projeto no Xcode

npx cap open ios

### Abra o projeto no Android

npx cap open android

### Gere os ícones e splash screens

```bash
pnpm run assets:generate
```

> Fonte única: **`public/images/logo.svg`** (símbolo da Replas, `#00AEEF`, sem
> o nome). O script roda `scripts/prepare-assets.sh`, que deriva dele os
> arquivos de `assets/` — não edite `assets/` à mão. Para trocar a logo,
> substitua `public/images/logo.svg`. Detalhes em
> [REBRANDING.md](./REBRANDING.md#gerar-ícones-e-splash).
>
> Fundo de ícones e splash: `#0f172a`. Ao final o script move `icons/` para
> `public/icons/`: o `@capacitor/assets` escreve os ícones PWA em `icons/` na
> raiz, que o Vite não copia para `dist/` — sem esse passo os 7 ícones do
> manifest voltam a dar 404.

Depois rode `npx cap sync`.

### Capgo Native Builds (Cloud)

Você pode solicitar builds nativos no cloud usando o Capgo. Isso é útil para gerar APK/AAB ou pacotes iOS sem precisar de um Mac/Android Studio local configurado para build final.

- **Configurar Credenciais (Primeira vez ou atualização)**

  ```bash
  pnpm run capgo:cred:save
  ```

- **Solicitar Build iOS**

  ```bash
  pnpm run capgo:build:ios
  ```

- **Solicitar Build Android**
  ```bash
  pnpm run capgo:build:android
  ```

> [!NOTE]
> As credenciais são salvas localmente pelo CLI do Capgo e não são enviadas para o repositório.
