# Flujo n8n para guion segmentado dirigido por agente

Guía enfocada en describir únicamente la lógica del agente y los nodos necesarios dentro de n8n para generar guiones segmentados con opción de continuidad o segmento único.

## 1. Resumen del flujo

- **Objetivo del proceso**: recibir un guion bruto, normalizar los datos de caracterización y producir un conjunto ordenado de cortes (`segments[]`) con continuidad garantizada entre ellos.
- **Resultado final esperado**: JSON de respuesta con segmentos listos para ensamblar un video (incluye metadatos y, cuando procede, `voiceProfile`).
- **Servicios sustituidos por nodos n8n**: los endpoints `POST /api/generate`, `POST /api/generateContinuation` y `POST /api/generate.plus` del repositorio original se reemplazan por nodos estándar (`Webhook`, `Function`, `OpenAI Chat`, `Merge`, `Respond to Webhook`). No es necesario desplegar el backend Node.js.

## 2. Entradas requeridas

- **Campos obligatorios del payload**:
  - `mode` (`"single"` | `"continuation"`).
  - `script` (texto ≥ 50 caracteres) o `segmentsDraft[]` cuando ya llega presegmentado.
  - `characterProfile` con `ageRange`, `gender` y al menos uno de: `voiceType` o bloque `voiceProfile` (`tone`, `pace`, `pitch`).
  - `product` y `narrativeStyle` para contextualizar cada corte.
- **Validaciones mínimas**:
  - Rechazar entradas vacías o con menos de 50 caracteres útiles (tras sanitizar espacios y HTML).
  - En modo `continuation`, asegurar un rango de 2 a 8 cortes: usar `targetSegments` si viene definido, de lo contrario calcularlo por longitud del guion (aprox. 6–8 frases por corte).
  - Confirmar coherencia entre `settingMode` y `locations`/`room` (sólo uno de ellos según el modo).
  - Verificar que `energyLevel` esté entre 40 y 100 y que `energyArc` sea (`"consistent"`, `"building"`, `"crescendo"`).
- **Parámetros opcionales que alteran cantidad o estilo de cortes**:
  - `targetSegments`, `maxDurationSec`, `continuityPriority` ("audio", "visual", "hybrid").
  - `cameraStyle`, `timeOfDay`, `backgroundLife`, `productStyle`, `accentRegion`, `characterFeatures`, `clothingDetails`.
  - `handoverNotes` o `creativeConstraints` para líneas que deben persistir o evitarse.

## 3. Pasos del workflow en n8n

1. **Webhook (Trigger)** – Recibe el payload y añade `requestId`, `receivedAt` y cabeceras útiles. Salida: objeto normalizado con `body` y `requestId`.
2. **Function: Sanitización inicial** – Limpia HTML, recorta espacios, homogeniza enums en minúsculas y valida campos obligatorios. Salida: `inputValidated` con banderas `isValid`/`errors`.
3. **IF (inputValidated.isValid)** – Si hay errores, salta al nodo de respuesta de error; si es válido, continúa con la generación.
4. **OpenAI Chat: Agente coordinador** – System prompt del archivo `instructions/agente-continuidad-maxima.md`. Entrada: `inputValidated`. Salida: objeto con `mode`, `scriptSegments[]`, `baseDescriptions`, `voiceProfileDraft`, `notes`.
5. **IF (mode === "single")** – Rama corta: tomar `scriptSegments[0]`, construir `segments[]` con un único elemento, saltar al ensamblado final.
6. **Split In Batches / Loop** – Para modo `continuation`, iterar sobre `scriptSegments`:
   - **Function: Context Builder** – Produce `currentSegment`, `previousSnapshot`, `continuityState`.
   - **OpenAI Chat: Agente de segmento** – Prompt específico para generar el detalle visual y narrativo por corte. Devuelve `segmentPayload` con `segment_info`, `scene_continuity`, `action_timeline`, `transition_to_next`.
   - **Function: Validación JSON** – Parsea y verifica duración, presencia de transición y consistencia con `baseDescriptions`.
   - **Function: Actualizar memoria** – Acumula el segmento y guarda `continuityState` para la siguiente iteración.
7. **IF (voiceProfileDraft incompleto)** – Cuando falten campos clave, llamar a **OpenAI Chat: Generador de voz** utilizando el primer segmento como contexto y completar `voiceProfile`.
8. **Function: Ensamblado final** – Agrupa `segments`, `mode`, `metadata` (conteo, duración total, `requestId`), `voiceProfile`. Prepara estructura final para la respuesta.
9. **Respond to Webhook** – Devuelve `success`, datos generados o, en caso de fallo, `error`, `requestId` y detalles mínimos para reintentos.

## 4. Salidas y verificaciones finales

- **Estructura resumida de la respuesta**:

  ```json
  {
    "success": true,
    "mode": "continuation",
    "segments": [ { "segment_info": { ... }, "character_description": { ... } } ],
    "metadata": {
      "totalSegments": 4,
      "estimatedDurationSec": 32,
      "requestId": "2025-10-24T12:00:00Z"
    },
    "voiceProfile": { "tone": "warm", "pace": "medium", "pitch": "slightly low" }
  }
  ```

- **Chequeos mínimos**:
  - Confirmar que `segments.length === metadata.totalSegments` y que cada objeto trae `segment_info.durationSec` dentro del rango permitido.
  - Validar continuidad narrativa: `transition_to_next` no debe estar vacío salvo en el último segmento, y `scene_continuity.location` debe coincidir con el inicio del siguiente corte.
  - Revisar que `voiceProfile` tenga los campos requeridos o, si no se envía, exista `voiceProfileReason` explicado en la salida.
  - Para `mode="single"`, asegurar ausencia de `transition_to_next` y que el `metadata.totalSegments` sea 1.

## 5. Notas operativas

- **Credenciales / variables**: `OPENAI_API_KEY` o credencial compartida `OpenAI API` en n8n; opcionalmente `N8N_WEBHOOK_URL` para componer enlaces de prueba y `SLACK_ALERT_WEBHOOK` si se avisan fallos.
- **Variables operativas**: `TEMPERATURE_SEGMENTS` (0.3–0.5), `MAX_TOKENS_SEGMENTS` (≤ 4500) y `VOICE_MODEL` (por ejemplo, `gpt-4o-mini`) definidas en un nodo `Set` o en Variables Globales.
- **Límites relevantes**: hasta 3 reintentos por cada nodo OpenAI con espera exponencial (2 s, 4 s, 8 s). Evitar superar 8 segmentos por ejecución para no rebasar cuota de tokens.
- **Fallback recomendado**: si tras los reintentos la respuesta sigue sin JSON válido, mover la entrada a un Data Store `failed_requests`, notificar vía Slack/Email y finalizar el flujo con `success:false`, `errorSummary` y `requestId`.

## 6. Checklist de despliegue

1. Crear una credencial `OpenAI API` en n8n y vincularla al nodo `OpenAI Chat` del flujo.
2. Publicar el `Webhook` y probar con un payload mínimo (`mode`, `script`, `characterProfile`). Guardar el `requestId`.
3. Ejecutar en modo `continuation` usando un guion de ejemplo con 4 párrafos; confirmar que el coordinador regrese `scriptSegments` y `baseDescriptions` completos.
4. Revisar en la ejecución que cada iteración produce `transition_to_next` y que la duración por segmento esté entre 6 y 8 segundos.
5. Repetir la prueba en modo `single` para validar la rama corta y la ausencia de transiciones.
6. Documentar tokens/duración, ajustar parámetros si hay recortes y registrar fecha/autor en la tabla de revisiones.

### Registro de revisiones

| Fecha | Autor | Descripción |
| --- | --- | --- |
| 2025-10-26 | Copilot | Actualización para documentar sólo el flujo n8n de guion segmentado y cumplir secciones solicitadas |
| 2025-10-22 | Equipo plataforma | Versión reducida enfocada en flujo n8n para guion segmentado |
| 2025-10-24 | Copilot | Incluye agente coordinador, opción de segmento único, integración Veo 3 y subida a Google Drive |
| 2025-10-24 | Copilot | Ajuste para dejar sólo la lógica del agente y nodos básicos en n8n |
