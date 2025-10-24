# Prompts para el flujo n8n de guion segmentado

Resumen operativo de los mensajes enviados a OpenAI (GPT-4o) dentro del flujo que construye segmentos de video. Usa esta guía al recrear los nodos HTTP Request en n8n.

## 1. Estrategia general

- **Plantillas base**: antes de llamar al modelo se carga uno de los archivos de instrucciones (`veo3-json-guidelines*.md`). En n8n, añade el contenido del archivo como parte del mensaje del rol `system`.
- **Estructura del chat**: cada petición usa dos mensajes:
  - `system`: "plantilla + instrucciones fijas".
  - `user`: "payload dinámico" con placeholders de los datos del run.
- **Formato de salida**: se fuerza `response_format: { type: "json_object" }` y se valida la respuesta con `JSON.parse`. Siempre deberías incluir un nodo Function que capture errores de parseo.
- **Parámetros comunes**: `model = gpt-4o`, `temperature` entre 0.3 y 0.5, `max_tokens` 4000–5000, `timeout` ≥ 120s, reintentos automáticos (3 con backoff exponencial recomendado).

## 2. Prompt de descripciones base

Genera los descriptores que se reutilizan en todos los segmentos.

### Mensaje `system` (descripciones)

```text
{CONTENIDO PLANTILLA}

Generate the base descriptions that will remain IDENTICAL across all segments. Follow the exact word count requirements. Return ONLY valid JSON.
```

### Mensaje `user` (descripciones)

Variables interpoladas desde el payload:

- Datos de personaje (`ageRange`, `gender`, `ethnicity`, `characterFeatures`).
- Estética (`style`, `productStyle`, `timeOfDay`, `backgroundLife`).
- Contexto espacial (`settingMode`, `room` o lista `locations`).
- Producto y modo (`product`, `narrativeStyle`, `energyArc`).
- Para modos animal agregar bloque `Avatar: ANIMAL ...`.

Ejemplo abreviado:

```text
Create base descriptions for:
Age: {{ageRange}}
Gender: {{gender}}
Setting Mode: {{settingMode}}
Room/Locations: {{room|locations}}
Style: {{style}}
Product: {{product}}
...
Return a JSON object with these exact keys:
{
  "physical": "[250+ words ...]",
  "clothing": "[150+ words ...]",
  "environment": "[250+ words ...]",
  "voice": "[100+ words ...]",
  "productHandling": "[50+ words ...]"
}
```

### Respuesta esperada (descripciones)

Objeto JSON con las claves anteriores (o versión animal: `animal_physical`, `animal_behavior`, `animal_voice`, `lip_sync_baseline`, `realism_rendering`, `environment`, `productHandling`). El nodo posterior debe validar longitud mínima y registrar errores.

## 3. Prompt de segmento

Genera un segmento completo reutilizando las descripciones base.

### Mensaje `system` (segmento)

```text
{CONTENIDO PLANTILLA}

Generate a Veo 3 JSON segment following the exact structure. Use the provided base descriptions WORD-FOR-WORD.
```

### Mensaje `user` (segmento)

Incluye:

- `segmentNumber`, `totalSegments`, texto `scriptPart`.
- Datos de continuidad (`previousLocation`, `nextLocation`, `previousSegment` resumen).
- Ajustes de estilo (`cameraStyle`, `timeOfDay`, `backgroundLife`, `energyArc`).
- Bloques de descripciones literalmente pegados (`physical`, `clothing`, `environment`, etc.).
- Para avatar animal: instrucciones extra de lip-sync y microexpresiones.

Fragmento tipo:

```text
Create segment {{i}} of {{total}}:
Dialogue: "{{scriptPart}}"
Product: {{product}}
Current Location: {{currentLocation}}
...
Base Descriptions (USE EXACTLY AS PROVIDED):
Physical: {{baseDescriptions.physical}}
Clothing: {{baseDescriptions.clothing}}
...
Generate the complete JSON with:
1. segment_info ...
2. character_description ...
3. scene_continuity ...
4. action_timeline ...
```

### Respuesta esperada (segmento)

JSON con secciones `segment_info`, `character_description`, `scene_continuity`, `action_timeline` (y `continuity_markers` o `lip_sync` según modo). Validar que `segment_info.transition_to_next` exista salvo en el último segmento y que la duración implícita sea 6–8 s.

## 4. Prompt de continuidad con perfil de voz (opcional)

Activado cuando `continuationMode` o `generateSegmentsWithVoiceProfile`.

- Se reutiliza el prompt de segmento para el primer bloque (formato `enhanced`).
- Tras obtener el segmento inicial, se ejecuta un prompt adicional que extrae un perfil de voz detallado (ver función `extractDetailedVoiceProfile` en el servicio). Estructura: describe pitch, ritmo, timbre y mapea visemas.
- Los segmentos siguientes usan un prompt reducido `generateContinuationStyleSegment` que enfatiza mantener `voiceProfile`, `eye_dynamics` y `breathing`. Replica el mismo formato, pero añade al mensaje del usuario una sección con el JSON del `voiceProfile`.

## 5. Prompts auxiliares (modo Plus)

- **Inferencia de ubicaciones**: prompt con `system` "You analyze UGC scripts..." y `user` que envía script completo, producto, estilo y número de segmentos. Devuelve `{ "locations": [ ... ] }`.
- **Inferencia de cámara**: similar, `system` "You are a creative TV ad director..."; devuelve `{ "camera": [ ... ] }` con valores de catálogo. Usar sólo cuando `cameraStyle = "ai-inspired"`.

## 6. Integración en n8n

1. **Nodo HTTP Request**: método POST, URL `https://api.openai.com/v1/chat/completions`, cabeceras `Content-Type: application/json`, `Authorization: Bearer {{$credentials.openai.apiKey}}`.
2. **Body**:

   ```json
   {
     "model": "gpt-4o",
     "temperature": 0.5,
     "max_tokens": 4500,
     "response_format": { "type": "json_object" },
     "messages": [
       { "role": "system", "content": "{{plantilla}}" },
       { "role": "user", "content": "{{prompt_dinamico}}" }
     ]
   }
   ```

3. **Post-proceso**: nodo Function que valida JSON, verifica claves requeridas y calcula duración estimada. Maneja reintentos fallidos con un Subworkflow o Merge.
4. **Registro**: guardar `messages` usados y la respuesta en un Data Store para depurar variaciones futuras.
5. **Fallback**: si tras 3 intentos la respuesta es inválida, devolver `success:false` y notificar a operaciones (Slack/Email).

## 7. Checklist rápido

- Confirmar que las plantillas están almacenadas y accesibles (filesystem, Static Data, o Credencial).
- Revisar que todas las interpolaciones escapen comillas (`replace(/"/g, '\"')`).
- Probar con guion > 400 caracteres y validar que `segments.length` se mantiene entre 4 y 8.
- Documentar cualquier tweak de prompt: fecha, autor y motivo (añadir al registro dentro de `logica.md`).

## 8. Tabla bilingüe de variables

| Campo visible (ES) | Clave API (EN) | Tipo | Descripción / Valores ejemplo | Notas para interfaz tipo chat |
| --- | --- | --- | --- | --- |
| Guion completo | `script` | string | Texto principal ≥ 50 caracteres. | Preguntar: "¿Cuál es el guion completo que quieres segmentar?" Validar longitud. |
| Formato JSON | `jsonFormat` | enum | `standard`, `plus`, `enhanced`, `continuation` | Sugerir según complejidad: "¿Quieres formato estándar o plus (con ubicaciones automáticas)?" |
| Modo escenografía | `settingMode` | enum | `single`, `producer`, `ai-inspired` | Explicar diferencias; si es `ai-inspired`, se activan prompts auxiliares. |
| Ubicación principal | `room` | string | Ej: `living room`, `kitchen` | Permite español en UI pero convertir a inglés antes de mandar. |
| Lista de locaciones | `locations` | array string | `["living room", "kitchen"]` | Preguntar sólo si `settingMode != single`. Instruir al usuario que puede escribir en español y mapear internamente. |
| Estilo narrativo | `style` | string | Ej: `casual and friendly`, `authoritative` | Mostrar sugerencias en español pero enviar en inglés. |
| Producto | `product` | string | Ej: `health insurance`, `solar panels` | Campo libre. |
| Tipo de voz | `voiceType` | string | Ej: `warm-friendly`, `authoritative` | Usar listado guía. Si se busca español, traducir a etiqueta inglesa equivalente. |
| Perfil de voz previo | `voiceProfile` | object | JSON con `tone`, `pace`, `pitch`, etc. | Solicitar sólo en continuación. Permitir pegar JSON. |
| Nivel de energía | `energyLevel` | number/string | Ej: `85` (0-100) | Preguntar "¿Qué nivel de energía quieres? (0-100)" |
| Arco de energía | `energyArc` | enum | `consistent`, `building`, `crescendo` | Explicar efecto en ritmo de cortes. |
| Estilo de cámara | `cameraStyle` | enum/string | `static-handheld`, `slow-push`, `orbit`, `ai-inspired` | Si usuario da descripción en español, mapear a opción más cercana. |
| Tiempo del día | `timeOfDay` | string | Ej: `morning`, `evening` | Convertir a inglés estándar (`mañana`→`morning`). |
| Elementos de fondo | `backgroundLife` | boolean | `true` / `false` | Preguntar con sí/no: "¿Quieres actividad de fondo?" |
| Manejo de producto | `productStyle` | string | Ej: `natural`, `demonstrativo`, `tutorial` | Mapear a etiqueta en inglés. |
| Estilo narrativo largo | `narrativeStyle` | string | Ej: `direct-review`, `storytelling` | Útil para ajustar prompts. |
| Rango de edad | `ageRange` | string | `25-34`, `35-44` | Mantener formato numérico. |
| Género | `gender` | string | `female`, `male`, `non-binary` | Preguntar respetuosamente y traducir. |
| Origen étnico | `ethnicity` | string | ej: `latina`, `afro-american` | Convertir a inglés; opcional. |
| Rasgos físicos | `characterFeatures` | string | Lista descriptiva | Permitir respuesta libre y traducir clave. |
| Detalles de vestuario | `clothingDetails` | string | Estilo y colores | Recomendable mantener en inglés o traducir antes de enviar. |
| Región/acento | `accentRegion` | string | Ej: `neutral-american`, `mexican`, `iberian` | Mapear a denominaciones esperadas por prompt. |
| Continuación | `continuationMode` | boolean | `true` / `false` | Preguntar: "¿Quieres continuar un video existente?" |
| Avatar animal | `useAnimalAvatar` | boolean | `true` / `false` | Sólo para modo animal. |
| Especie animal | `animalPreset` | enum | `tiger`, `monkey`, `fish` | Mostrar catálogo traducido (tigre, mono, pez). |
| Estilo de voz animal | `animalVoiceStyle` | string | `narrator`, `playful`, `deep-resonant` | Mantener valores en inglés. |
| Antropomórfico | `anthropomorphic` | boolean | `true` / `false` | Preguntar: "¿El avatar es antropomórfico?" |

### Sugerencias para la UI tipo chat

1. Preguntar primero por el objetivo y el guion: "¿Qué video necesitas crear y cuál es el guion base?".
2. Guiar al usuario por grupos de parámetros (escenografía, personaje, estilo de cámara, voz).
3. Para cada pregunta, mostrar ejemplos bilingües y convertir automáticamente la respuesta a las claves en inglés antes de llamar al API.
4. Resumir al final todas las variables recogidas y pedir confirmación. Mostrar el JSON que se enviará para transparencia.
5. Guardar presets comunes para reutilizar (ej. estilo UGC casual, modo plus con locaciones automáticas).
