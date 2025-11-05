# Guía de integración n8n para UGC Veo3

Esta guía explica cómo usar el workflow de n8n para automatizar la generación de segmentos UGC con continuidad de voz usando tu backend Express.

## Requisitos previos

- **n8n instalado** (v1.0+ recomendado): `npm install -g n8n` o usa Docker.
- **Backend corriendo**: tu servidor Express en `http://localhost:3001`.
- **Credenciales configuradas**: `OPENAI_API_KEY` y opcionalmente `GOOGLE_GEMINI_API_KEY` o Vertex AI.

---

## Paso 1: Importar el workflow

1. Abre n8n en tu navegador: `http://localhost:5678`.
2. Ve a **Workflows** → **Import from File** (o **Add Workflow** → **Import from File**).
3. Selecciona el archivo `n8n-workflow-ugc-veo3.json` desde la raíz de este proyecto.
4. Haz clic en **Import**.

---

## Paso 2: Configurar el webhook

El workflow está configurado para recibir solicitudes POST en:

```
http://localhost:5678/webhook/ugc-veo3
```

### Payload de entrada esperado

```json
{
  "script": "Hola, soy Ana y hoy quiero mostrarte el purificador AireZen...",
  "product": "Purificador AireZen",
  "ageRange": "25-34",
  "gender": "female",
  "voiceType": "warm-friendly",
  "energyLevel": "80",
  "continuationMode": true,
  "jsonFormat": "enhanced",
  "settingMode": "single",
  "room": "living room",
  "saveToFile": false
}
```

**Campos obligatorios:**
- `script` (string, mínimo 50 caracteres)
- `product` (string)

**Campos opcionales con defaults:**
- `ageRange`: `"25-34"`
- `gender`: `"female"`
- `voiceType`: `"warm-friendly"`
- `energyLevel`: `"80"`
- `continuationMode`: `true`
- `jsonFormat`: `"enhanced"`
- `settingMode`: `"single"`
- `room`: `"living room"`
- `cameraStyle`: `"static-handheld"`
- `timeOfDay`: `"morning"`
- `backgroundLife`: `false`
- `productStyle`: `"natural"`
- `energyArc`: `"consistent"`
- `narrativeStyle`: `"direct-review"`
- `saveToFile`: `false` (si es `true`, guarda resultado en `/tmp/ugc-veo3-{characterId}.json`)

---

## Paso 3: Activar el workflow

1. En el editor de n8n, haz clic en el botón **Active** en la parte superior derecha para activar el workflow.
2. El webhook quedará escuchando en modo producción.

---

## Paso 4: Probar el workflow

### Usando `curl`

```bash
curl -X POST "http://localhost:5678/webhook/ugc-veo3" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Hola, soy Ana y hoy quiero mostrarte cómo el purificador AireZen ha transformado el aire de mi hogar. Es increíble la diferencia que se siente en solo minutos.",
    "product": "Purificador AireZen",
    "ageRange": "25-34",
    "gender": "female",
    "continuationMode": true,
    "saveToFile": true
  }'
```

### Usando Postman

1. **Method**: POST
2. **URL**: `http://localhost:5678/webhook/ugc-veo3`
3. **Headers**: `Content-Type: application/json`
4. **Body (raw JSON)**:

```json
{
  "script": "Tu guion aquí...",
  "product": "Nombre del producto"
}
```


### Respuesta esperada

```json
{
  "success": true,
  "characterId": "human_female_25-34_1730736000000",
  "voiceProfile": {
    "baseVoice": "Alto voice at 165-185 Hz...",
    "technical": {
      "pitchRange": "165-185 Hz",
      "speakingRate": "145-150 wpm",
      "toneQualities": "Warm, friendly, approachable...",
      "breathingPattern": "Natural pauses between phrases...",
      "emotionalInflections": {
        "excitement": "Pitch rises 10-15 Hz",
        "emphasis": "Slight volume increase on key words",
        "warmth": "Soft smile tone maintained"
      }
    }
  },
  "totalSegments": 3,
  "videos": [
    {
      "segmentNumber": 1,
      "status": "description_generated",
      "videoDescription": "Frame-by-frame description...",
      "prompt": "UGC Video Segment 1 of 3...",
      "duration": "8 seconds",
      "message": "Video description generated. Full Veo 3 integration coming soon!"
    },
    // ... más segmentos
  ],
  "timestamp": "2025-11-04T10:30:00.000Z",
  "service": "gemini"
}
```

---

## Arquitectura del workflow

### Diagrama de flujo

```
┌─────────────┐
│   Webhook   │  POST /webhook/ugc-veo3
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│  Generate Segments       │  POST /api/generate
│  (continuationMode:true) │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Extract & Validate Data │  Extrae segments, voiceProfile, metadata
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Generate Videos         │  POST /api/generate-videos
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Process Video Results   │  Combina datos finales
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Should Save to File?    │  Valida campo saveToFile
└──────┬───────────────────┘
       │
       ├─ TRUE ──▶ Save Results to File (/tmp/*.json)
       │
       └─ FALSE ─▶ Webhook Response Success
```

### Nodos del workflow

1. **Webhook**: Recibe la petición HTTP POST con el payload.
2. **Generate Segments**: Llama a `/api/generate` con `continuationMode: true`.
3. **Extract & Validate Data**: Valida respuesta y extrae `segments`, `voiceProfile`, `metadata`.
4. **Generate Videos**: Llama a `/api/generate-videos` con los segmentos generados.
5. **Process Video Results**: Combina resultados finales en un objeto JSON unificado.
6. **Should Save to File?**: Condicional que evalúa `saveToFile`.
7. **Save Results to File**: Si `saveToFile=true`, guarda JSON en `/tmp/ugc-veo3-{characterId}.json`.
8. **Webhook Response Success**: Retorna resultado completo al cliente.
9. **Error Handler** (no visible en flujo normal): Captura errores y retorna respuesta 500.

---

## Personalización del workflow

### Cambiar la URL del backend

Si tu backend no corre en `localhost:3001`, edita los nodos:
- **Generate Segments**: cambia `url` a tu endpoint.
- **Generate Videos**: cambia `url` a tu endpoint.

### Agregar autenticación

Si proteges tus endpoints con API Key:

1. Abre el nodo **Generate Segments**.
2. Ve a la sección **Authentication**.
3. Selecciona **Header Auth** o **Generic Credential Type**.
4. Agrega el header `Authorization: Bearer YOUR_API_KEY`.

### Guardar en base de datos

Reemplaza el nodo **Save Results to File** por:
- **Postgres Node**: guarda en tabla `ugc_generations`.
- **MongoDB Node**: inserta documento en colección `videos`.
- **Redis Node**: guarda en key `ugc:{characterId}`.

Ejemplo con Postgres:

```javascript
// En un nodo Code antes de Postgres
const data = $input.first().json;

return [{
  json: {
    character_id: data.characterId,
    voice_profile: JSON.stringify(data.voiceProfile),
    segments_count: data.totalSegments,
    videos: JSON.stringify(data.videos),
    created_at: new Date()
  }
}];
```

### Enviar a S3/GCS

Después del nodo **Process Video Results**, añade:
- **AWS S3 Node**: sube JSON a bucket.
- **Google Cloud Storage Node**: sube a GCS.

---

## Manejo de errores

El workflow incluye manejo de errores básico:
- Si `/api/generate` falla, el error se propaga.
- Si `/api/generate-videos` falla, se captura y retorna status 500.

Para mejorar resiliencia:
1. Agrega nodo **Error Trigger** conectado a todos los nodos críticos.
2. Implementa reintentos con **Loop Node** y delays exponenciales.
3. Envía notificaciones a Slack/Discord con nodo **HTTP Request**.

---

## Monitoreo y logs

### Logs en n8n

- Cada ejecución queda registrada en **Executions** → selecciona tu workflow.
- Puedes ver el output de cada nodo y tiempos de ejecución.

### Logs del backend

Consulta `server.log` o la consola donde corre tu backend Express para ver:
```
[Generate] Request received: { bodyKeys: [...], scriptLength: 150 }
[OpenAI] Starting generation with format: enhanced
[OpenAI] Script split into 3 segments
[Veo3] Generating videos for 3 segments
```

---

## Casos de uso avanzados

### 1. Persistir `voiceProfile` para reutilizar

Después de **Extract & Validate Data**, añade un nodo **HTTP Request** o **Postgres**:

```javascript
// Nodo Code
const data = $input.first().json;

// Guardar en Redis
await $http.request({
  method: 'SET',
  url: 'http://redis:6379',
  body: {
    key: `voiceProfile:${data.characterId}`,
    value: JSON.stringify(data.voiceProfile),
    ttl: 86400 // 24 horas
  }
});

return [$input.first()];
```

### 2. Generar múltiples variantes

Duplica el flujo desde **Generate Segments** con diferentes parámetros:
- Variante 1: `energyLevel: "80"`, `style: "casual"`
- Variante 2: `energyLevel: "90"`, `style: "energetic"`
- Merge ambos resultados al final.

### 3. Integración con Slack

Después de **Process Video Results**, añade nodo **Slack**:

```
Message: "✅ Generados {{ $json.totalSegments }} segmentos para {{ $json.characterId }}"
Channel: #ugc-automation
```


---

## Troubleshooting

### Error: "Failed to generate segments"

**Causa**: Backend no responde o script demasiado corto.

**Solución**:

1. Verifica que el backend esté corriendo: `curl http://localhost:3001/api/health`.
2. Valida que `script` tenga al menos 50 caracteres.
3. Revisa logs del backend para ver detalles del error.

### Error: "No segments provided for video generation"

**Causa**: El nodo **Extract & Validate Data** no encuentra `segments` en la respuesta.

**Solución**:

1. Revisa la respuesta de **Generate Segments** en el output del nodo.
2. Asegúrate de que `continuationMode: true` esté presente en el payload.

### Webhook no responde

**Causa**: Workflow desactivado o n8n no escuchando.

**Solución**:

1. Activa el workflow: botón **Active** en la esquina superior derecha.
2. Verifica que n8n esté corriendo: `ps aux | grep n8n`.
3. Prueba el webhook test URL desde el nodo **Webhook** (modo test).

---

## Siguientes pasos

- [ ] Agregar autenticación a los endpoints del backend.
- [ ] Implementar cola de procesamiento con Bull/BullMQ para generación asíncrona.
- [ ] Integrar Veo 3.1 API real (requiere acceso privado de Google Cloud).
- [ ] Agregar monitoreo con Prometheus exportando métricas desde n8n.
- [ ] Crear dashboard en Grafana para visualizar métricas de generación.

---

## Recursos adicionales

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [Guía de API endpoints](./instructions/veo3-api-guide.md)
- [Plantillas Veo3 JSON](./instructions/)

---

## Soporte

Si tienes problemas con el workflow:
1. Revisa los logs de ejecución en n8n (panel **Executions**).
2. Consulta los logs del backend Express (`server.log`).
3. Valida que todos los servicios externos (OpenAI, Gemini) estén accesibles.
