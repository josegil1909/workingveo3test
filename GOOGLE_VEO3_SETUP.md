# Guía de Configuración - Google Veo 3

Esta guía te ayudará a configurar correctamente las credenciales de Google para usar Veo 3 con este sistema.

## Opción A: Google Gemini API (Recomendado)

La forma más simple de empezar. Ideal para desarrollo y proyectos pequeños.

### Pasos

1. **Ve a Google AI Studio**
   - Abre [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Inicia sesión con tu cuenta de Google

2. **Crea una API Key**
   - Click en "Create API Key"
   - Selecciona un proyecto existente o crea uno nuevo
   - Copia la clave generada (empieza con `AI...`)

3. **Configura tu .env**
   ```bash
   GOOGLE_GEMINI_API_KEY=AIza...tu-clave-aqui
   ```

4. **Verifica la configuración**
   ```bash
   # Inicia el servidor
   pnpm run dev
   
   # Deberías ver en los logs:
   # [Veo3] Gemini API client initialized
   ```

### Límites de Gemini API

- **Gratuito**: 15 peticiones por minuto
- **Pagando**: Hasta 360 peticiones por minuto
- **Costo**: Variable según el modelo usado

---

## Opción B: Vertex AI (Empresarial)

Para proyectos que requieren mayor control, quotas más altas y características empresariales.

### Requisitos Previos

- Cuenta de Google Cloud con facturación habilitada
- Proyecto de Google Cloud creado
- `gcloud` CLI instalado ([instrucciones](https://cloud.google.com/sdk/docs/install))

### Pasos

#### 1. Configurar Google Cloud Project

```bash
# Iniciar sesión
gcloud auth login

# Crear proyecto (opcional)
gcloud projects create mi-proyecto-veo3 --name="Veo 3 UGC Generator"

# Configurar proyecto activo
gcloud config set project mi-proyecto-veo3

# Habilitar APIs necesarias
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

#### 2. Crear Service Account

```bash
# Crear la cuenta de servicio
gcloud iam service-accounts create veo3-service \
  --display-name="Veo 3 Service Account" \
  --description="Service account for UGC Veo 3 generator"

# Otorgar permisos necesarios
gcloud projects add-iam-policy-binding mi-proyecto-veo3 \
  --member="serviceAccount:veo3-service@mi-proyecto-veo3.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Permisos adicionales (opcional, según necesidades)
gcloud projects add-iam-policy-binding mi-proyecto-veo3 \
  --member="serviceAccount:veo3-service@mi-proyecto-veo3.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

#### 3. Descargar Credenciales

```bash
# Generar y descargar la clave JSON
gcloud iam service-accounts keys create ./service-account-key.json \
  --iam-account=veo3-service@mi-proyecto-veo3.iam.gserviceaccount.com

# Verificar que se creó
ls -lh service-account-key.json
```

#### 4. Configurar .env

```bash
# Añade estas líneas a tu .env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
VERTEX_PROJECT_ID=mi-proyecto-veo3
VERTEX_LOCATION=us-central1
```

#### 5. Verificar Configuración

```bash
# Inicia el servidor
pnpm run dev

# Deberías ver en los logs:
# [Veo3] Vertex AI client initialized
# [Veo3] Project: mi-proyecto-veo3, Location: us-central1
```

### Regiones Disponibles

Vertex AI está disponible en estas regiones:

- `us-central1` (Iowa) - Recomendado
- `us-east4` (Virginia)
- `us-west1` (Oregon)
- `europe-west1` (Bélgica)
- `europe-west4` (Países Bajos)
- `asia-southeast1` (Singapur)

Elige la región más cercana a tus usuarios para mejor latencia.

### Límites de Vertex AI

- **Quotas más altas** que Gemini API
- **SLA empresarial** garantizado
- **Facturación detallada** por proyecto
- **Soporte técnico** disponible

---

## Comparación: Gemini API vs Vertex AI

| Característica | Gemini API | Vertex AI |
|----------------|------------|-----------|
| Configuración | ✅ Simple (1 API key) | ⚠️ Compleja (Service Account) |
| Costo | 💰 Bajo para empezar | 💰💰 Más costoso |
| Quotas | Limitadas (15-360 req/min) | Altas (configurable) |
| SLA | ❌ No garantizado | ✅ Garantizado |
| Soporte | Comunidad | Google Cloud Support |
| Ideal para | Desarrollo, prototipos | Producción, empresas |

---

## Troubleshooting

### Error: "Veo 3 service not initialized"

**Causa:** No se encontraron credenciales de Google.

**Solución:**

```bash
# Verifica tu .env
cat .env | grep -E "GOOGLE_GEMINI_API_KEY|GOOGLE_APPLICATION_CREDENTIALS"

# Si está vacío, añade una de las opciones
```

### Error: "Permission denied" (Vertex AI)

**Causa:** La Service Account no tiene permisos suficientes.

**Solución:**

```bash
# Verificar permisos actuales
gcloud projects get-iam-policy mi-proyecto-veo3 \
  --flatten="bindings[].members" \
  --filter="bindings.members:veo3-service@*"

# Añadir permiso faltante
gcloud projects add-iam-policy-binding mi-proyecto-veo3 \
  --member="serviceAccount:veo3-service@mi-proyecto-veo3.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Error: "Quota exceeded"

**Causa:** Has excedido las quotas de tu plan.

**Solución:**

```bash
# Ver quotas actuales
gcloud compute project-info describe --project=mi-proyecto-veo3

# Solicitar aumento de quota en Google Cloud Console
# https://console.cloud.google.com/iam-admin/quotas
```

### Error: "Invalid API key" (Gemini)

**Causa:** API key incorrecta o expirada.

**Solución:**
1. Ve a [AI Studio](https://aistudio.google.com/app/apikey)
2. Verifica que tu key esté activa
3. Si está revocada, crea una nueva
4. Actualiza tu `.env`

---

## Seguridad

### Para Gemini API

```bash
# ✅ CORRECTO: en .env (no subir a Git)
GOOGLE_GEMINI_API_KEY=AIza...

# ❌ INCORRECTO: hardcoded en el código
const apiKey = "AIza..."; // ¡No hacer esto!
```

### Para Vertex AI

```bash
# Añadir a .gitignore
echo "service-account-key.json" >> .gitignore

# Verificar que no está en Git
git ls-files | grep service-account-key.json
# (no debe retornar nada)
```

### Rotación de Credenciales

Rota tus credenciales cada 90 días:

```bash
# Para Gemini API: crear nueva key en AI Studio

# Para Vertex AI:
gcloud iam service-accounts keys create ./service-account-key-new.json \
  --iam-account=veo3-service@mi-proyecto-veo3.iam.gserviceaccount.com

# Actualizar .env con la nueva ruta
# Eliminar la clave antigua después de verificar que funciona:
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=veo3-service@mi-proyecto-veo3.iam.gserviceaccount.com
```

---

## Costos Estimados

### Gemini API

- **Nivel gratuito**: Incluye uso limitado
- **Pagando**: ~$0.001 por 1K tokens
- **Costo por segmento**: ~$0.05 - $0.10

### Vertex AI

- **Sin nivel gratuito** (requiere facturación)
- **Precio**: Variable según modelo y región
- **Costo por segmento**: ~$0.10 - $0.20

*Nota: Precios aproximados, verificar en [Google Cloud Pricing](https://cloud.google.com/vertex-ai/pricing)*

---

## Recursos Adicionales

- [Google AI Studio](https://aistudio.google.com/)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/quickstart)
- [Service Accounts Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

---

## Próximos Pasos

Una vez configuradas las credenciales:

1. ✅ Reinicia el servidor: `pnpm run dev`
2. ✅ Verifica los logs para confirmar inicialización
3. ✅ Prueba generando un segmento: ver [API_DOCS.md](./API_DOCS.md)
4. ✅ Lee la documentación de los endpoints disponibles
