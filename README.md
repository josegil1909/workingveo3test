# Generador de Scripts UGC para Veo 3.1

Sistema completo para convertir guiones UGC en videos reales usando **Google Veo 3.1 API**.

> **🚀 ¿Primera vez?** Lee [QUICKSTART.md](./QUICKSTART.md) para empezar en 5 minutos.
>
> **🎬 Nueva funcionalidad:** ¡Ahora genera videos reales con Veo 3.1! Lee [VEO3_IMPLEMENTATION.md](./VEO3_IMPLEMENTATION.md) para detalles.

## Funcionalidades

- 📝 **División de guiones**: divide automáticamente guiones largos en segmentos de 8 segundos
- 🎭 **Dos formatos JSON**:
  - Estándar (300+ palabras)
  - Continuidad mejorada (500+ palabras con microexpresiones)
- 🎬 **Generación real de videos**: crea videos MP4 con Veo 3.1 (audio nativo incluido)
- 🎯 **Integración con Gemini**: generación de descripciones y prompts optimizados
- 📦 **Exportación masiva**: descarga todos los segmentos en un archivo ZIP
- 💰 **Estimación de costos**: visualiza el costo de generación de video por adelantado
- 🔄 **Modo continuación**: genera videos que mantienen coherencia visual entre segmentos
- 🖼️ **Reference Images**: soporte para hasta 3 imágenes de referencia (Veo 3.1)
- 🎵 **Audio nativo**: diálogos, efectos de sonido y música generados automáticamente

## Configuración

### 1. Instalar dependencias

```bash
npm run install-all
```

### 2. Configurar claves API

**Guía rápida:**

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y añade tus claves:
   ```bash
   # OpenAI (Obligatorio)
   OPENAI_API_KEY=sk-tu-clave-aqui
   
   # Google Gemini (Recomendado para empezar)
   GOOGLE_GEMINI_API_KEY=tu-clave-gemini
   ```

3. **Para configuración detallada de Google Veo 3**, consulta: [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md)

**Opciones disponibles:**
- ✅ **Gemini API**: Simple, ideal para desarrollo ([obtener clave](https://aistudio.google.com/app/apikey))
- ⚙️ **Vertex AI**: Empresarial, mayor control ([guía completa](./GOOGLE_VEO3_SETUP.md#opción-b-vertex-ai-empresarial))

## Ejecución de la aplicación

### Desarrollo

```bash
npm run dev
```

Disponible en [http://localhost:3001](http://localhost:3001)

### Producción

```bash
npm run build
npm start
```

## Uso

1. **Ingresa tu guion**: pega el guion UGC (mínimo 50 caracteres)
2. **Configura opciones**:
   - Selecciona rango de edad, género y estilo del espacio
   - Elige formato JSON (Estándar o Continuidad mejorada)
3. **Genera segmentos**: crea los segmentos JSON listos para IA
4. **Genera videos** (opcional): obtiene descripciones de video con Veo 3
5. **Descarga**: exporta todos los segmentos en un ZIP

## Endpoints de la API

Ver documentación completa en [API_DOCS.md](./API_DOCS.md)

**Generación de Segmentos:**
- `POST /api/generate` - Genera segmentos JSON estándar
- `POST /api/generate-plus` - Genera segmentos con formato mejorado
- `POST /api/generate-continuation` - Genera continuación de video
- `POST /api/generate-new-cont` - Genera nueva continuación optimizada

**Generación de Videos:**
- `POST /api/generate-videos` - Genera videos con Veo 3 (estándar)
- `POST /api/generate-videos-plus` - Genera videos con Veo 3 (plus)

**Descarga de Archivos:**
- `POST /api/download` - Descarga segmentos en ZIP (estándar)
- `POST /api/download-plus` - Descarga segmentos en ZIP (plus)

**Utilidades:**
- `GET /api/health` - Verificar estado del servidor

## Información de costos

### Google Veo 3 (API oficial)

- **Costo estimado**: $0.75 por segundo de video
- **Segmentos de 8 segundos**: ~$6 por segmento
- **Ejemplo**: 5 segmentos = ~$30

*Nota: Los precios son estimados y pueden variar según el plan de Google Cloud*

## Scripts de Desarrollo

```bash
# Formatear código con Biome
pnpm run format

# Verificar formato sin cambios
pnpm run format:check

# Ejecutar linter y aplicar correcciones
pnpm run lint

# Verificar linting sin cambios
pnpm run lint:check

# Ejecutar formato y linting juntos
pnpm run check

# CI/CD: verificar todo sin cambios
pnpm run check:ci
```

## Estructura del Proyecto

```
.
├── api/
│   ├── routes/           # Endpoints REST
│   │   ├── generate.js          # Generación estándar
│   │   ├── generate.plus.js     # Generación mejorada
│   │   ├── generateContinuation.js  # Modo continuación
│   │   └── generate.newcont.js  # Nueva continuación
│   └── services/         # Servicios externos
│       ├── openaiService.js     # Integración OpenAI
│       └── veo3Service.js       # Integración Google Veo 3
├── client/               # React frontend
│   └── src/
│       ├── components/   # Componentes React
│       └── api/         # Cliente API
├── instructions/         # Prompts y templates
├── runs/                # Logs de ejecuciones
└── server.js           # Servidor Express
```

## Despliegue

### Heroku

```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set GOOGLE_GEMINI_API_KEY=...
git push heroku main
```

### Google Cloud Run

```bash
gcloud run deploy ugc-script-splitter \
  --source . \
  --set-env-vars OPENAI_API_KEY=sk-... \
  --set-env-vars GOOGLE_GEMINI_API_KEY=... \
  --allow-unauthenticated
```

### Docker (Opcional)

```bash
# Construir imagen
docker build -t ugc-veo3-generator .

# Ejecutar contenedor
docker run -p 3001:3001 \
  -e OPENAI_API_KEY=sk-... \
  -e GOOGLE_GEMINI_API_KEY=... \
  ugc-veo3-generator
```

## Seguridad

### Buenas Prácticas

- ✅ **Nunca** subas archivos `.env` o API keys a Git
- ✅ Añade `service-account-key.json` a `.gitignore`
- ✅ Usa variables de entorno para información sensible
- ✅ Rota tus API keys periódicamente
- ✅ Implementa rate limiting (ya incluido)
- ✅ Valida todas las entradas del usuario

### Variables de Entorno Sensibles

```bash
# En producción, configura estas variables según tu plataforma:
OPENAI_API_KEY=           # Requerido
GOOGLE_GEMINI_API_KEY=    # Requerido para Veo 3
NODE_ENV=production       # Importante para logs
```

## Troubleshooting

### Error: "OpenAI API key not configured"

**Solución:**

```bash
# Verifica que tu .env tenga la key
cat .env | grep OPENAI_API_KEY

# Si está vacío, agrégala:
echo "OPENAI_API_KEY=sk-tu-clave" >> .env
```

### Error: "Veo 3 service not initialized"

**Solución:**

```bash
# Verifica tu Google API key
cat .env | grep GOOGLE_GEMINI_API_KEY

# Agrégala si falta:
echo "GOOGLE_GEMINI_API_KEY=tu-clave" >> .env
```

### El servidor no inicia

**Solución:**

```bash
# Reinstala dependencias
pnpm run install-all

# Verifica el puerto
lsof -i :3001

# Si está ocupado, usa otro puerto:
PORT=3002 pnpm run server
```

### Rate limit alcanzado (429)

**Solución:**
- Espera 60 segundos antes de reintentar
- Configura límites personalizados en `.env`:

```bash
RATE_LIMIT_WINDOW_MS=120000    # 2 minutos
RATE_LIMIT_MAX_REQUESTS=20     # 20 peticiones
```

## Testing

```bash
# Manual testing
pnpm run dev

# Probar endpoint health
curl http://localhost:3001/api/health

# Probar generación (ver API_DOCS.md para ejemplos completos)
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

## Próximas Funcionalidades

- [ ] Generación directa de video con Google Veo 3 API
- [ ] Soporte de imagen a video (image2video)
- [ ] Vista previa de video en el navegador
- [ ] Procesamiento en lote para múltiples guiones
- [ ] Dashboard de analytics
- [ ] Webhooks para notificaciones
- [ ] Cache de segmentos generados

## Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit: `git commit -am 'Agrega nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Estándares de Código

- Usa Biome para formateo: `pnpm run check`
- Sigue las convenciones de ES6+
- Documenta funciones complejas
- Escribe mensajes de commit descriptivos

## Licencia

MIT

## Soporte

- 📧 Email: [tu-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/tu-repo/issues)
- 📚 Docs: Ver [API_DOCS.md](./API_DOCS.md)
