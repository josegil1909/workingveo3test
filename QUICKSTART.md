# 🚀 Inicio Rápido - UGC Script Generator para Veo 3

Esta guía te ayudará a tener el sistema funcionando en 5 minutos.

## Prerequisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Una cuenta de OpenAI con API key
- Una cuenta de Google con acceso a AI Studio

## Instalación en 5 Pasos

### 1. Clonar y preparar

```bash
cd /ruta/a/tu/proyecto
pnpm install
cd client && pnpm install && cd ..
```

### 2. Configurar variables de entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar con tus claves
nano .env
```

Agrega tus claves:

```env
OPENAI_API_KEY=sk-tu-clave-openai
GOOGLE_GEMINI_API_KEY=tu-clave-gemini
```

**Dónde obtener las claves:**
- OpenAI: https://platform.openai.com/api-keys
- Google Gemini: https://aistudio.google.com/app/apikey

### 3. Construir el frontend

```bash
pnpm run build
```

### 4. Iniciar el servidor

```bash
pnpm start
```

### 5. Verificar que funciona

Abre tu navegador en: http://localhost:3001

O prueba con curl:

```bash
curl http://localhost:3001/api/health
```

Deberías ver: `{"status":"ok","timestamp":"..."}`

## Uso Básico

### Desde la interfaz web

1. Ve a http://localhost:3001
2. Pega tu guion UGC en el campo de texto
3. Completa los campos obligatorios:
   - Edad
   - Género
   - Producto
   - Ubicación
   - Estilo
4. Click en "Generate Segments"
5. Descarga los resultados en JSON o ZIP

### Desde la API

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Este producto cambió mi vida. Antes tenía problemas, ahora todo es fácil. Lo recomiendo.",
    "ageRange": "25-35",
    "gender": "female",
    "product": "SmartClean",
    "room": "living room",
    "style": "modern"
  }'
```

## Desarrollo

Para desarrollo con hot reload:

```bash
pnpm run dev:watch
```

Esto iniciará:
- Servidor backend en http://localhost:3001
- Watch del cliente React (rebuild automático)

## Comandos Útiles

```bash
# Formatear código
pnpm run format

# Ejecutar linter
pnpm run lint

# Verificar formato + lint
pnpm run check

# Ver logs del servidor
tail -f server.log
```

## Troubleshooting Rápido

### Error: "Cannot find module"

```bash
pnpm run install-all
```

### Error: "API key not configured"

```bash
# Verifica tu .env
cat .env | grep API_KEY

# Si está vacío, edítalo:
nano .env
```

### Puerto 3001 ocupado

```bash
# Usa otro puerto
PORT=3002 pnpm start
```

### Build de React falla

```bash
cd client
rm -rf node_modules
pnpm install
pnpm run build
cd ..
```

## Próximos Pasos

✅ Sistema funcionando → Lee [API_DOCS.md](./API_DOCS.md) para usar los endpoints

✅ Quieres más control → Lee [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md) para Vertex AI

✅ Desplegar en producción → Lee sección "Despliegue" en [README.md](./README.md)

✅ Ver ejemplos completos → Revisa las carpetas `runs/plus/` para outputs reales

## Obtener Ayuda

- 📖 Documentación completa: [README.md](./README.md)
- 🔌 API Reference: [API_DOCS.md](./API_DOCS.md)
- ⚙️ Configuración Google: [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md)
- 📝 Resumen de cambios: [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)

---

**¡Listo!** Ahora puedes empezar a generar segmentos UGC para Veo 3 🎬
