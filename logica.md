# Flujo n8n para guion segmentado dirigido por agente

Guía enfocada en describir únicamente la lógica del agente y los nodos necesarios dentro de n8n para generar guiones segmentados con opción de continuidad o segmento único.

## 1. Resumen del flujo

- **Objetivo**: montar en n8n un agente principal que recopile la información del usuario, decida si trabaja en modo `single` o `continuation` y convoque a subagentes para producir segmentos consistentes.
- **Resultado esperado**: respuesta JSON con el arreglo `segments[]`, metadatos y (cuando se solicita) `voiceProfile`, lista para consumir por otros sistemas desde n8n.
- **Servicios reemplazados**: cualquier backend personalizado se sustituye por nodos estándar de n8n (Webhook, Function, OpenAI Chat). No se requiere consultar archivos `.js` del repositorio original.

## 2. Entradas requeridas

- **Campos obligatorios** que el agente debe validar:
  - `mode` (`"single"` | `"continuation"`).
  - `script` (string ≥ 50 caracteres) si el usuario entrega un texto completo.
  - `characterProfile` con al menos `ageRange`, `gender` y `voiceType` *o* `voiceProfile`.
- **Validaciones mínimas**:
  - Rechazar si `script` no alcanza la longitud mínima o llega vacío.
  - Si `mode="continuation"`, asegurar `targetSegments` (2–8) o permitir que el agente lo infiera del largo del guion.
  - Confirmar que `voiceProfile` incluya `tone`, `pace`, `pitch` cuando se suministra.
- **Parámetros opcionales que modifican la generación**:
  - `energyArc`, `energyLevel`, `cameraStyle`, `timeOfDay`, `settingMode`, `backgroundLife`.
  - `locations[]` y `productStyle` para enriquecer el contexto visual.
  - `handoverNotes` para instrucciones especiales que se mantendrán entre segmentos.

## 3. Pasos del workflow en n8n

1. **Webhook (POST)** – Entrada principal del payload. Añade `requestId` y normaliza claves (`camelCase`).
2. **Function: Sanitización** – Limpia espacios, convierte enums a minúsculas y verifica que existan los campos obligatorios.
3. **OpenAI Chat: Agente coordinador** – Usa como mensaje `system` la plantilla correspondiente de `instructions/veo3-enhanced-continuity.md` o `veo3-json-guidelines*.md`. El mensaje `user` incluye los datos recopilados. Resultado esperado:
   - `mode` definitivo (`single` o `continuation`).
   - `scriptSegments[]` (array de objetos con `index` y `text`). Si el usuario no entregó segmentos, el agente divide el guion.
   - `baseDescriptions` (`physical`, `clothing`, `environment`, etc.) adecuados para reutilizar en todos los cortes.
   - `voiceProfile` completo o instrucciones para generarlo.
4. **Switch / IF (mode)** – Rama `single`: mantener un único segmento; rama `continuation`: iterar sobre `scriptSegments`.
5. **OpenAI Chat: Agente de descripciones base** (opcional) – Se ejecuta sólo si el coordinador devolvió descripciones incompletas. Prompt: *“Generate the base descriptions that remain identical...”* con `response_format` JSON.
6. **Split In Batches (segmentos)** – Recorre `scriptSegments` en orden. Para cada elemento:
   1. **Function: Contexto** – Construye `previousSegment`, `nextLocation` y resume la continuidad acumulada.
   2. **OpenAI Chat: Agente de segmento** – Prompt de `prompts.md` que exige usar las descripciones base palabra por palabra. Produce un JSON con `segment_info`, `character_description`, `scene_continuity`, `action_timeline`.
   3. **Function: Validación de JSON** – Aplica `JSON.parse`, revisa que existan `transition_to_next` (excepto en el último) y que la duración declarada esté entre 6 y 8 segundos.
   4. **Function: Memoria** – Agrega el segmento al arreglo global y actualiza `continuityState` (ubicación, gesto final, energía).
7. **If: Perfil de voz** – Si falta `voiceProfile`, ejecutar un nodo OpenAI con la instrucción `extractDetailedVoiceProfile` para generar la ficha a partir del primer segmento.
8. **Function: Ensamblado final** – Combina `segments[]`, `voiceProfile`, `metadata` (total de segmentos, duración total aproximada, `requestId`). Si se requiere exportar, preparar el JSON para nodos posteriores (por ejemplo, Google Drive), pero esos pasos son opcionales a este flujo lógico.
9. **Respond to Webhook** – Devuelve `{ success: true, mode, segments, metadata, voiceProfile? }`. En caso de error controlado, responder `{ success: false, error, requestId }`.

## 4. Salidas y verificaciones finales

- **Estructura esperada**:

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
  - `segments.length` coincide con `metadata.totalSegments`.
  - Cada segmento contiene `segment_info.location`, `scene_continuity.camera_position` y `action_timeline.dialogue`.
  - Las transiciones (`transition_to_next`) mantienen continuidad entre segmentos consecutivos.
  - Si `mode="single"`, la respuesta incluye exactamente un segmento y omite transiciones.

## 5. Notas operativas

- **Credenciales**: sólo necesitas la API Key de OpenAI configurada en el nodo correspondiente.
- **Variables recomendadas**: `TEMPERATURE_SEGMENTS` (0.3–0.5) y `MAX_TOKENS_SEGMENTS` (4500) almacenadas como variables de entorno o `Set` node.
- **Límites sugeridos**: máximo 3 reintentos automáticos por cada llamada al agente; pausa de 2 segundos entre segmentos cuando la cola supera 5 elementos.
- **Fallback**: si la respuesta de OpenAI no es JSON válido tras los reintentos, registrar el error en un Data Store y responder `success:false` con el `requestId` para reintento manual.

## 6. Checklist de despliegue

1. Configurar el Webhook y probar con un payload mínimo (`mode`, `script`, `characterProfile`).
2. Verificar que el agente coordinador genere `scriptSegments` coherentes y base descriptions completas.
3. Correr una prueba en modo `continuation` con guion de 4 párrafos; revisar continuidad y transiciones.
4. Correr una prueba en modo `single`; confirmar que el flujo omite la rama iterativa.
5. Documentar la ejecución (tokens, duración) y ajustar `temperature`/`max_tokens` si el modelo recorta contenido.
6. Actualizar el registro de revisiones al finalizar la validación.

### Registro de revisiones

| Fecha | Autor | Descripción |
| --- | --- | --- |
| 2025-10-22 | Equipo plataforma | Versión reducida enfocada en flujo n8n para guion segmentado |
| 2025-10-24 | Copilot | Incluye agente coordinador, opción de segmento único, integración Veo 3 y subida a Google Drive |
| 2025-10-24 | Copilot | Ajuste para dejar sólo la lógica del agente y nodos básicos en n8n |
