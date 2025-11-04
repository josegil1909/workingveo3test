# Documentación API - UGC Script Generator para Veo 3

## Base URL

```
http://localhost:3001
```

Para producción, reemplaza con tu dominio.

## Autenticación

Actualmente no se requiere autenticación. Todas las API keys se configuran en el servidor mediante variables de entorno.

## Rate Limiting

- **Límite**: 10 peticiones por minuto por IP
- **Ventana**: 60 segundos

## Resumen de Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Verificar estado del servidor |
| `/api/generate` | POST | Generar segmentos estándar |
| `/api/generate-plus` | POST | Generar segmentos mejorados |
| `/api/generate-continuation` | POST | Generar continuación |
| `/api/generate-new-cont` | POST | Nueva continuación |
| `/api/generate-videos` | POST | Generar videos (estándar) |
| `/api/generate-videos-plus` | POST | Generar videos (plus) |
| `/api/download` | POST | Descargar ZIP (estándar) |
| `/api/download-plus` | POST | Descargar ZIP (plus) |

---

## Endpoints

### 1. Health Check

Verifica el estado del servidor.

**Endpoint:** `GET /api/health`

**Respuesta exitosa (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-11-03T10:30:00.000Z"
}
```

---

### 2. Generate Standard Segments

Genera segmentos JSON estándar a partir de un guion UGC.

**Endpoint:** `POST /api/generate`

**Body Parameters:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `script` | string | ✅ | Guion UGC (mínimo 50 caracteres) |
| `ageRange` | string | ✅ | Rango de edad: "18-25", "25-35", "35-45", "45+" |
| `gender` | string | ✅ | Género: "male", "female", "non-binary" |
| `product` | string | ✅ | Nombre del producto |
| `room` | string | ✅ | Ubicación: "living room", "kitchen", "bedroom", etc. |
| `style` | string | ✅ | Estilo: "modern", "cozy", "minimalist", etc. |
| `jsonFormat` | string | ❌ | Formato: "standard" o "enhanced" (default: "standard") |
| `voiceType` | string | ❌ | Tipo de voz: "warm", "energetic", "conversational" |
| `energyLevel` | string | ❌ | Nivel de energía: "low", "medium", "high" |
| `settingMode` | string | ❌ | Modo: "single" o "mixed" (default: "single") |
| `locations` | array | ❌ | Array de ubicaciones para modo "mixed" |
| `ethnicity` | string | ❌ | Etnia del personaje |
| `characterFeatures` | string | ❌ | Características físicas adicionales |
| `clothingDetails` | string | ❌ | Descripción de vestimenta |
| `accentRegion` | string | ❌ | Región del acento |

**Ejemplo de petición:**

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Este producto ha cambiado mi vida completamente. Antes tenía que lidiar con problemas constantes, pero ahora todo es más fácil. Lo recomiendo totalmente.",
    "ageRange": "25-35",
    "gender": "female",
    "product": "SmartClean Pro",
    "room": "living room",
    "style": "modern",
    "jsonFormat": "standard",
    "voiceType": "warm",
    "energyLevel": "medium"
  }'
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "segments": [
    {
      "segment_info": {
        "segment_number": 1,
        "duration": "8 seconds",
        "script_text": "Este producto ha cambiado mi vida completamente.",
        "word_count": 7
      },
      "character": {
        "age_range": "25-35",
        "gender": "female",
        "ethnicity": "Latina",
        "physical_description": "...",
        "clothing": "...",
        "voice": "...",
        "personality": "..."
      },
      "setting": {
        "location": "modern living room",
        "time_of_day": "morning",
        "lighting": "...",
        "background": "..."
      },
      "camera": {
        "shot_type": "medium shot",
        "angle": "eye level",
        "movement": "static"
      },
      "action": {
        "starting_position": "...",
        "gesture": "...",
        "facial_expression": "...",
        "movement": "..."
      }
    }
  ],
  "metadata": {
    "total_segments": 1,
    "total_duration": "8 seconds",
    "format": "standard",
    "product": "SmartClean Pro"
  }
}
```

**Errores:**

- `400`: Script muy corto o parámetros faltantes
- `429`: Demasiadas peticiones (rate limit)
- `500`: Error del servidor

---

### 3. Generate Enhanced Segments (Plus)

Genera segmentos con formato mejorado y mayor detalle.

**Endpoint:** `POST /api/generate-plus`

**Body Parameters:** Mismos que `/api/generate`

**Diferencias:**
- Mayor detalle en descripciones (500+ palabras vs 300+)
- Incluye microexpresiones
- Mejor continuidad entre segmentos
- Guarda inputs/outputs en `runs/plus/{timestamp}/`

**Ejemplo de petición:**

```bash
curl -X POST http://localhost:3001/api/generate-plus \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Mi rutina matutina cambió por completo. Ahora tengo más tiempo para mí.",
    "ageRange": "25-35",
    "gender": "female",
    "product": "SmartMorning App",
    "room": "bedroom",
    "style": "cozy",
    "jsonFormat": "enhanced",
    "energyLevel": "high"
  }'
```

**Respuesta:** Similar a `/api/generate` pero con más detalle en cada campo.

---

### 4. Generate Continuation Segment

Genera un segmento de continuación basado en un frame final.

**Endpoint:** `POST /api/generate-continuation`

**Body Parameters:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `imageUrl` | string | ✅ | URL del frame final del video anterior |
| `script` | string | ✅ | Texto del siguiente segmento |
| `voiceProfile` | object | ✅ | Perfil de voz del personaje |
| `product` | string | ✅ | Nombre del producto |
| `previousSegment` | object | ❌ | Información del segmento anterior |
| `maintainEnergy` | boolean | ❌ | Mantener nivel de energía |

**Ejemplo de petición:**

```bash
curl -X POST http://localhost:3001/api/generate-continuation \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/final-frame.jpg",
    "script": "Y esto es solo el comienzo de algo increíble.",
    "voiceProfile": {
      "type": "warm",
      "pitch": "medium",
      "pace": "moderate"
    },
    "product": "SmartLife Pro",
    "maintainEnergy": true
  }'
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "segment": {
    "segment_info": {
      "segment_number": 2,
      "continuation_of": 1,
      "duration": "8 seconds"
    },
    "continuity": {
      "start_frame_match": "...",
      "position_consistency": "...",
      "lighting_match": "..."
    },
    "character": { ... },
    "setting": { ... },
    "camera": { ... },
    "action": { ... }
  }
}
```

---

### 5. Generate New Continuation

Genera continuación con soporte para avatares animales.

**Endpoint:** `POST /api/generate-new-cont`

**Body Parameters:** Mismos que `/api/generate` más:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `useAnimalAvatar` | boolean | ❌ | Usar avatar animal en lugar de humano |
| `animalPreset` | string | ❌ | Tipo: "tiger", "monkey", "fish" |
| `animalVoiceStyle` | string | ❌ | Estilo: "narrator", "playful", "deep-resonant" |
| `anthropomorphic` | boolean | ❌ | Si el animal tiene características humanas |

**Ejemplo con avatar animal:**

```bash
curl -X POST http://localhost:3001/api/generate-new-cont \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Hola amigos, les voy a contar un secreto increíble.",
    "product": "JunglePower Vitamins",
    "room": "jungle clearing",
    "style": "natural",
    "useAnimalAvatar": true,
    "animalPreset": "tiger",
    "animalVoiceStyle": "narrator",
    "anthropomorphic": true,
    "ageRange": "adult",
    "gender": "male"
  }'
```

**Respuesta:** Similar a otros endpoints pero con características adaptadas al avatar animal.

---

### 6. Generate Videos (Standard)

Genera descripciones de video usando Google Veo 3 para segmentos estándar.

**Endpoint:** `POST /api/generate-videos`

**Body Parameters:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `segments` | array | ✅ | Array de segmentos generados previamente |

**Ejemplo de petición:**

```bash
curl -X POST http://localhost:3001/api/generate-videos \
  -H "Content-Type: application/json" \
  -d '{
    "segments": [
      {
        "segment_info": { "segment_number": 1 },
        "character": { ... },
        "setting": { ... }
      }
    ]
  }'
```

---

### 7. Generate Videos Plus

Genera descripciones de video para segmentos en formato mejorado.

**Endpoint:** `POST /api/generate-videos-plus`

**Body Parameters:** Mismos que `/api/generate-videos`

---

### 8. Download Segments (Standard)

Descarga todos los segmentos generados en formato ZIP.

**Endpoint:** `POST /api/download`

**Body Parameters:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `segments` | array | ✅ | Array de segmentos para descargar |
| `metadata` | object | ❌ | Metadata adicional |

**Respuesta:** Archivo ZIP binario con todos los segmentos en JSON.

---

### 9. Download Segments Plus

Descarga segmentos en formato mejorado como ZIP.

**Endpoint:** `POST /api/download-plus`

**Body Parameters:** Mismos que `/api/download`

---

## Ejemplos de Integración

### JavaScript (Fetch)

```javascript
async function generateSegments(scriptData) {
  const response = await fetch('http://localhost:3001/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scriptData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Uso
const result = await generateSegments({
  script: "Tu guion aquí...",
  ageRange: "25-35",
  gender: "female",
  product: "Mi Producto",
  room: "living room",
  style: "modern"
});

console.log(result.segments);
```

### Python (Requests)

```python
import requests

def generate_segments(script_data):
    url = 'http://localhost:3001/api/generate'
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, json=script_data, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Uso
result = generate_segments({
    'script': 'Tu guion aquí...',
    'ageRange': '25-35',
    'gender': 'female',
    'product': 'Mi Producto',
    'room': 'living room',
    'style': 'modern'
})

print(result['segments'])
```

### cURL

```bash
# Generar segmentos estándar
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d @script-data.json

# Verificar salud del servidor
curl http://localhost:3001/api/health
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Petición exitosa |
| 400 | Datos inválidos o faltantes |
| 429 | Límite de rate excedido |
| 500 | Error interno del servidor |

---

## Estructura de Errores

```json
{
  "error": "Descripción del error",
  "message": "Detalles adicionales (en desarrollo)",
  "details": { ... }
}
```

---

## Notas Importantes

1. **Rate Limiting**: Respeta el límite de 10 peticiones por minuto
2. **Tamaño del Script**: Mínimo 50 caracteres
3. **Timeout**: Las peticiones pueden tardar 30-60 segundos dependiendo de la complejidad
4. **Formato JSON**: Usa "enhanced" para mayor detalle (más lento pero mejor calidad)
5. **Modo Continuación**: Requiere un frame final del video anterior para mantener coherencia

---

## Soporte

Para reportar problemas o solicitar características:
- Abre un issue en el repositorio
- Revisa los logs del servidor para más detalles sobre errores
