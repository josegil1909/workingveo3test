# Guía de endpoints para orquestación UGC (Veo 3)

Esta guía resume cómo interactúan los agentes internos con los dos flujos principales expuestos por el backend Express (`server.js`), ambos servidos por `POST /api/generate`:

- Generación estándar.
- Continuación avanzada activando `continuationMode: true` desde el frontend.

> **Contexto operativo:** El backend aplica un *rate limit* de 10 solicitudes por minuto y espera `Content-Type: application/json`. No se exige autenticación por defecto; considera envolver estas llamadas detrás de un gateway con API Keys o JWT si se expone fuera del entorno controlado.

## 1. `POST /api/generate` — Generación estándar

### Contrato mínimo

- `script` (**string**, obligatorio): texto a convertir en segmentos. Debe tener al menos 50 caracteres; se recomienda ~20 palabras por segmento.
- `product` (**string**, obligatorio): nombre corto del producto para orientar descripciones.
- `ageRange` (**string**, recomendado): valores aceptados `"18-24"`, `"25-34"`, `"35-44"`, `"45-54"`, `"55+"`. La UI lo marca como requerido para mantener consistencia narrativa.
- `gender` (**string**, recomendado): `"female"`, `"male"`, `"non-binary"`.
- Campos adicionales aceptados (opcionales, con defaults en el frontend):
  - `voiceType` (`warm-friendly`, `professional-clear`, `energetic-upbeat`, `calm-soothing`, `conversational-casual`).
  - `energyLevel` (string numérica **50-100**).
  - `style`, `jsonFormat` (`standard` | `enhanced`), `settingMode` (`single` | `home-tour` | `indoor-outdoor`).
  - Escenarios: `room` (cuando `settingMode === "single"`) o `locations` (array de strings cuando hay varias locaciones).
  - Ajustes visuales y narrativos: `cameraStyle`, `timeOfDay`, `backgroundLife`, `productStyle`, `energyArc`, `narrativeStyle`.
  - Detalles de personaje: `ethnicity`, `characterFeatures`, `clothingDetails`, `accentRegion`.

La respuesta exitosa incluye:

```jsonc
{
  "success": true,
  "segments": [ /* array de JSON Veo 3 */ ],
  "metadata": {
    "totalSegments": 4,
    "estimatedDuration": 32,
    "characterId": "human_female_25-34_1700000000000"
  },
  "voiceProfile": null // o un objeto cuando se ejecute en modo continuidad
}
```

### Buenas prácticas

- Prevalida longitud del guion para no agotar cuota de OpenAI en solicitudes inválidas.
- Loguea `metadata.characterId` y correlaciónalo con tus IDs internos para trazabilidad y observabilidad.
- Versiona las plantillas (`instructions/*.md`) si necesitas ajustes; cambia `jsonFormat` a `enhanced` para obtener marcadores de continuidad adicionales.

### Ejemplo `curl`

```bash
curl -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Hola, soy Ana y hoy quiero mostrar cómo el purificador AireZen mejora nuestro hogar...",
    "product": "Purificador AireZen",
    "ageRange": "25-34",
    "gender": "female",
    "voiceType": "warm-friendly",
    "energyLevel": "80",
    "jsonFormat": "standard",
    "settingMode": "single",
    "room": "living room",
    "cameraStyle": "static-handheld",
    "timeOfDay": "morning",
    "backgroundLife": false,
    "productStyle": "natural",
    "energyArc": "consistent",
    "narrativeStyle": "direct-review"
  }'
```

## 2. `POST /api/generate` — Modo Continuación del UI (`continuationMode: true`)

El tab "Modo de continuación" del frontend reutiliza el mismo endpoint pero añade `continuationMode: true`. Bajo el capó se ejecuta `OpenAIService.generateSegmentsWithVoiceProfile`, que devuelve un `voiceProfile` derivado del primer segmento.

### Campos clave

- Se reutilizan los mismos campos que en la generación estándar, con las mismas validaciones.
- Añade `continuationMode: true` y, opcionalmente, forza `jsonFormat: "enhanced"` para obtener marcadores de continuidad más ricos.
- El backend devolverá `voiceProfile` (objeto JSON). Persistelo para reutilizarlo en iteraciones posteriores.

### Recomendaciones

- Usa el `voiceProfile` en cada ejecución posterior; permite que la IA mantenga timbre, ritmo y acentos.
- Considera almacenar el `results.settings` que la UI genera para depurar divergencias.

### Ejemplo `curl`

```bash
curl -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Seguimos con la serie sobre AireZen: en este episodio...",
    "product": "Purificador AireZen",
    "ageRange": "25-34",
    "gender": "female",
    "voiceType": "professional-clear",
    "energyLevel": "75",
    "jsonFormat": "enhanced",
    "settingMode": "home-tour",
    "locations": ["living room", "kitchen", "bedroom"],
    "cameraStyle": "slow-push",
    "timeOfDay": "afternoon",
    "backgroundLife": true,
    "productStyle": "showcase",
    "energyArc": "building",
    "narrativeStyle": "day-in-life",
    "continuationMode": true
  }'
```

La respuesta incluirá `voiceProfile`; guárdalo (por ejemplo en una base de datos o KV) indexado por `characterId` para reutilizarlo en iteraciones futuras o futuros endpoints que lo soporten.

## 3. `POST /api/generate-videos` — Generación de videos desde segmentos

Una vez generados los segmentos JSON, usa este endpoint para convertirlos en descripciones de video listas para Veo 3.

### Payload esperado

- `segments` (**array**, obligatorio): array de objetos JSON generados previamente por `/api/generate`. Cada segmento debe incluir `segment_info`, `character_description`, `scene_continuity` y `action_timeline`.

### Respuesta típica

```jsonc
{
  "success": true,
  "videos": [
    {
      "success": true,
      "segmentNumber": 1,
      "videoDescription": "[Descripción frame-by-frame generada por Gemini]",
      "prompt": "[Prompt enviado a Gemini]",
      "duration": "8 seconds",
      "status": "description_generated",
      "message": "Video description generated. Full Veo 3 integration coming soon!"
    },
    // ... más segmentos
  ],
  "service": "gemini",
  "message": "Video generation initiated successfully"
}
```

### Buenas prácticas

- Valida que `segments` no esté vacío antes de llamar al endpoint.
- El backend usa Gemini (`gemini-1.5-flash`) o Vertex AI según configuración; asegúrate de tener `GOOGLE_GEMINI_API_KEY` o credenciales de Vertex AI.
- La respuesta actual devuelve **descripciones textuales** de video; la integración completa con Veo 3 para generar archivos `.mp4` requiere acceso a la API privada de Veo 3.1 (Google Cloud).
- Registra `status` de cada video para detectar fallos parciales y reintentar solo los segmentos fallidos.

### Ejemplo `curl`

```bash
curl -X POST "http://localhost:3001/api/generate-videos" \
  -H "Content-Type: application/json" \
  -d '{
    "segments": [
      {
        "segment_info": {
          "segment_number": 1,
          "total_segments": 3,
          "duration": "00:00-00:08",
          "location": "living room"
        },
        "character_description": {
          "current_state": "Ana, mujer de 28 años, sonriendo mientras sostiene el purificador AireZen..."
        },
        "action_timeline": {
          "dialogue": "Hola, soy Ana y hoy quiero mostrar cómo el purificador AireZen mejora nuestro hogar.",
          "synchronized_actions": {
            "0:00-0:02": "Mira a cámara con sonrisa cálida",
            "0:02-0:04": "Señala el purificador con mano derecha",
            "0:04-0:06": "Gesticula abriendo brazos",
            "0:06-0:08": "Asiente con entusiasmo"
          }
        },
        "scene_continuity": {
          "camera_position": "Medium shot, eye level, slight handheld movement",
          "props_in_frame": "Purificador AireZen sobre mesa de café, sofá beige al fondo"
        }
      }
    ]
  }'
```

### Notas de implementación

Este endpoint actúa como intermediario que:
1. Recibe segmentos JSON estructurados.
2. Los convierte en prompts detallados para Gemini.
3. Gemini genera descripciones shot-by-shot.
4. Retorna las descripciones que podrías alimentar manualmente a Veo 3 o a un futuro pipeline automático.

Para producción con videos reales:
- Implementa integración con Vertex AI Veo 3.1 API (requiere acceso privado y cuotas altas).
- Agrega cola de procesamiento (Bull, BullMQ) para gestionar generación asíncrona de videos.
- Almacena videos generados en GCS/S3 y retorna URLs firmadas.

## Observabilidad y pruebas automatizadas

- Instrumenta métricas (p. ej. con Prometheus + Grafana o APM tipo Datadog) sobre `latency`, `error_rate` y conteo de tokens OpenAI para controlar costos.
- Agrega pruebas end-to-end ligeras que validen la forma JSON (`ajv` o `zod`) antes de enviar payloads a OpenAI para atrapar errores de validación temprano.
- Versiona los `curl` anteriores como scripts en `scripts/` o `tests/` con `newman`/`vitest` para automatizar regresiones.

## Próximos pasos sugeridos

- Implementar almacenamiento seguro de `voiceProfile` (Redis, DynamoDB o Postgres con cifrado en reposo).
- Añadir autenticación y *rate limiting* por API Key si se expone a terceros.
- Integrar un *circuit breaker* o *retry with jitter* cuando OpenAI responda con códigos 429/500.
