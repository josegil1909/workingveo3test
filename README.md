# Divisor de guiones UGC para Veo 3

Convierte tus guiones UGC en segmentos de video listos para IA con soporte integrado de Veo 3.

## Funcionalidades

- 📝 **División de guiones**: divide automáticamente guiones largos en segmentos de 8 segundos
- 🎭 **Dos formatos JSON**:
  - Estándar (300+ palabras)
  - Continuidad mejorada (500+ palabras con microexpresiones)
- 🎬 **Integración con Veo 3**: genera descripciones de video (la generación completa llegará pronto)
- 📦 **Exportación masiva**: descarga todos los segmentos en un ZIP
- 💰 **Estimación de costos**: visualiza el costo de generación de video por adelantado

## Configuración

### 1. Instalar dependencias

```bash
npm run install-all
```

### 2. Configurar claves API

Crea un archivo `.env` en el directorio raíz:

```env
# OpenAI (Obligatorio)
OPENAI_API_KEY=sk-...

# Elige UNO de estos métodos de autenticación:

# Opción A: API de Gemini (simple)
GOOGLE_GEMINI_API_KEY=tu-api-key-de-gemini

# Opción B: Vertex AI con Service Account (empresarial)
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/service-account-key.json
VERTEX_PROJECT_ID=tu-project-id
VERTEX_LOCATION=us-central1

# Opción C: Kie.ai para generación real de video (¡93% más barato!)
KIEAI_API_KEY=tu-api-key-de-kieai
```

### 3. Configurar Vertex AI (si lo usas)

1. **Crear una Service Account**:

   ```bash
   gcloud iam service-accounts create veo3-service \
     --display-name="Veo 3 Service Account"
   ```

2. **Otorgar permisos necesarios**:

   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:veo3-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Descargar la clave de la Service Account**:

   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=veo3-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Actualizar .env**:

   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   VERTEX_PROJECT_ID=tu-project-id
   VERTEX_LOCATION=us-central1
   ```

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

- `POST /api/generate` - Genera segmentos JSON a partir del guion
- `POST /api/download` - Descarga los segmentos en ZIP
- `POST /api/generate-videos` - Genera descripciones de video

## Información de costos

### API oficial de Veo 3 (cuando esté disponible)

- **Costo**: $0.75 por segundo de video
- **Segmentos de 8 segundos**: $6 por segmento
- **Ejemplo**: 5 segmentos = $30

### Integración con Kie.ai (¡disponible hoy!)

- **Costo**: $0.40 por video (tarifa fija, no por segundo)
- **Segmentos de 8 segundos**: $0.40 por segmento
- **Ejemplo**: 5 segmentos = $2
- **Ahorro**: 93% más barato que la API oficial

## Configuración de Kie.ai (para generación real de video)

1. **Regístrate en [https://siliconflow.cn](https://siliconflow.cn)**
   - Usa tu cuenta de Google para acceder rápido
   - Recarga tu saldo (mínimo $5)

2. **Obtén tu API key**
   - Entra a la sección API Keys
   - Copia tu llave

3. **Agrégala al `.env`**

   ```env
   KIEAI_API_KEY=tu-api-key-de-kieai
   ```

4. **Úsala en la app**
   - Activa "Use Kie.ai" en el Generador de Video
   - Los videos se generan en 5-8 minutos
   - Los enlaces de descarga aparecen cuando están listos

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
  --allow-unauthenticated
```

## Notas de seguridad

- Nunca subas a Git las API keys ni los archivos de cuentas de servicio
- Añade `service-account-key.json` a `.gitignore`
- Usa variables de entorno para toda la información sensible

## Próximas funcionalidades

- [ ] Generación directa de video con Veo 3 (cuando la API esté disponible)
- [ ] Soporte de imagen a video
- [ ] Vista previa de video en el navegador
- [ ] Procesamiento en lote para múltiples guiones

## Licencia

MIT
