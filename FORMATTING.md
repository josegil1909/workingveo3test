# Guía de Formateo con Biome y Markdownlint

Este proyecto usa dos herramientas para mantener el código limpio y consistente:

## 🎨 Biome - Para JavaScript/TypeScript/JSON

**Biome** formatea y valida código JavaScript, TypeScript y JSON.

### Comandos disponibles:

```bash
# Formatear código
pnpm run format

# Solo verificar formato (sin cambiar archivos)
pnpm run format:check

# Arreglar problemas de lint
pnpm run lint

# Solo verificar lint
pnpm run lint:check

# Formatear + lint (recomendado)
pnpm run check

# Check para CI (no modifica archivos)
pnpm run check:ci
```

### Configuración

La configuración está en `biome.json`:

- **Indentación**: 2 espacios
- **Comillas**: Simples (`'`)
- **Semicolons**: Requeridos
- **Line width**: 100 caracteres

### Archivos ignorados:

- `node_modules/`
- `build/`, `dist/`
- `.env`, `*.log`
- `*.md` (Markdown usa markdownlint)
- `runs/**`
- `client/build/**`

## 📝 Markdownlint - Para archivos Markdown

**Markdownlint** formatea y valida archivos `.md`.

### Comandos disponibles:

```bash
# Formatear Markdown
pnpm run format:md

# Solo verificar formato Markdown
pnpm run format:md:check
```

### Configuración

La configuración está en `.markdownlint.json`:

**Reglas deshabilitadas** (para documentación técnica):

- `MD013`: Sin límite de longitud de línea
- `MD033`: HTML permitido
- `MD034`: URLs sin formato permitidas
- `MD041`: Primera línea no requiere ser H1
- `MD026`: Puntuación en títulos permitida

**Reglas flexibles:**

- `MD022`: Espacios alrededor de títulos (1 línea)
- `MD024`: Títulos duplicados permitidos si no son hermanos
- `MD025`: Múltiples H1 permitidos

### Archivos formateados:

- `*.md` (raíz del proyecto)
- `instructions/**/*.md` (subdirectorios)

### Archivos ignorados:

- `node_modules/**`
- `client/node_modules/**`

## 🚀 Workflow Recomendado

### Antes de commit:

```bash
# Formatear todo (JS + MD)
pnpm run format

# O si prefieres revisar primero:
pnpm run check:ci
```

### En CI/CD:

```bash
# Verificar sin modificar archivos
pnpm run check:ci
```

## 🔧 Integración con VSCode

### Extensiones recomendadas:

1. **Biome** (`biomejs.biome`)
   - Formateo automático al guardar
   - Lint en tiempo real

2. **Markdownlint** (`DavidAnson.vscode-markdownlint`)
   - Validación de Markdown en tiempo real

### Configuración en VSCode:

Agrega a `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[markdown]": {
    "editor.defaultFormatter": "DavidAnson.vscode-markdownlint"
  },
  "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome"
}
```

## 📚 Recursos

### Biome:

- Documentación: <https://biomejs.dev>
- Playground: <https://biomejs.dev/playground>

### Markdownlint:

- Documentación: <https://github.com/DavidAnson/markdownlint>
- Reglas: <https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md>

## 🐛 Troubleshooting

### Error: "Biome no encontrado"

```bash
pnpm install
```

### Error: "Markdownlint no encontrado"

```bash
pnpm install -D markdownlint-cli2
```

### Formateo no funciona en archivos específicos

Verifica que no estén en la lista de `ignore` en:

- `biome.json` (para JS/TS/JSON)
- `.markdownlint.json` (para MD)

### Conflicto entre Prettier y Biome

**Biome reemplaza a Prettier**. Si tienes Prettier instalado:

1. Desinstala Prettier: `pnpm remove prettier`
2. Elimina `.prettierrc` o `prettier.config.js`
3. Usa solo Biome

## ✨ Tips

### Formatear un archivo específico:

```bash
# Con Biome
npx @biomejs/biome format --write path/to/file.js

# Con Markdownlint
npx markdownlint-cli2 --fix path/to/file.md
```

### Ignorar una línea específica:

**JavaScript (Biome):**

```javascript
// biome-ignore lint/suspicious/noExplicitAny: necesario para este caso
const data: any = {};
```

**Markdown (Markdownlint):**

```markdown
<!-- markdownlint-disable MD013 -->
Esta línea muy larga no será validada por la regla MD013
<!-- markdownlint-enable MD013 -->
```

## 📋 Resumen de Comandos

```bash
# Todo en uno
pnpm run format              # Formatear JS/TS/JSON + MD
pnpm run check              # Formatear + lint todo
pnpm run check:ci           # Verificar todo (CI)

# Solo JavaScript/TypeScript/JSON
pnpm run format             # Formatear código
pnpm run lint               # Arreglar lint
pnpm run check              # Formatear + lint

# Solo Markdown
pnpm run format:md          # Formatear MD
pnpm run format:md:check    # Verificar MD
```
