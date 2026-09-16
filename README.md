# Antiquário de Bragança — módulo Foundry VTT

Catálogo de itens mágicos raros e ferramenta de sorteio, portado do site
[antiquario-braganca](https://github.com/gersonetto/antiquario-braganca) pra
rodar dentro do Foundry VTT (v13/v14). Vanilla TypeScript + Handlebars
(`ApplicationV2`), sem React — a lógica pura de moeda e sorteio foi copiada
quase literal do site; a camada de UI foi reescrita nos padrões nativos do
Foundry.

## Antes de instalar

1. **Substitua `SEU_USUARIO`** em `static/module.json` (campos `url`, `manifest`,
   `download`) pelo seu usuário/organização do GitHub, depois de criar o
   repositório.
2. **Configure a URL do catálogo** dentro do Foundry: Configurar Ajustes →
   Módulos → "URL do catálogo" → cole `https://<seu-site>/api/catalog`. Sem
   isso o catálogo fica vazio (o módulo não tem fallback de dados embutido na
   primeira instalação, só depois do primeiro fetch bem-sucedido).

## Desenvolvimento

```bash
npm install
npm run build       # build único em dist/
npm run dev         # build em modo watch (rebuilda a cada mudança em src/ ou static/)
npm test            # roda os testes de lógica pura (currency + sorteio)
```

Symlink `dist/` pra dentro da pasta de dados do Foundry pra testar:

```powershell
# Windows (PowerShell, admin)
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\antiquario-braganca" -Target "$PWD\dist"
```

JS exige F5 pra recarregar; CSS/HBS/JSON recarregam sozinhos via
`flags.hotReload` (já declarado no `module.json`).

## Publicando uma release

```bash
# bump de versão em package.json antes de taguear
git tag v0.1.0
git push --tags
```

O workflow `.github/workflows/release.yml` builda, empacota `dist/` num
`module.zip` e publica a GitHub Release com `module.json` e o zip anexados.
O manifest de instalação fica sempre em:

```
https://github.com/<usuario>/antiquario-braganca-foundry/releases/latest/download/module.json
```

Cole essa URL na tela "Install Module" do Foundry.

## O que ainda precisa de verificação manual (não testável fora do Foundry)

Este projeto foi construído e testado (`tsc`, `vitest`, `vite build`) fora de
uma instância real do Foundry — não há como validar aqui dentro:

- `game.settings.registerMenu` aceitando `ShopApplication` (ApplicationV2)
  diretamente como `type`.
- Nome exato do hook de render de chat (`renderChatMessageHTML`) na build
  real de v13 vs v14 instalada.
- `compatibility.minimum/verified` em `static/module.json` — hoje están com
  `"13"` como palpite conservador; ajuste depois de testar contra as builds
  reais.
- O fluxo completo fim a fim descrito no plano de implementação (catálogo
  visível a jogador, sorteio GM-only, publicação e reroll no chat).
