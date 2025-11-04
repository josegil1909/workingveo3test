# 🤖 Guía para IA: Endpoints de Generación de Guiones

Esta guía está diseñada para que una IA pueda solicitar la información correcta al usuario y generar peticiones válidas a los endpoints.

---

## 📋 Endpoint 1: `/api/generate` - Generación Estándar

**Propósito:** Generar segmentos UGC en formato estándar o mejorado.

### Campos REQUERIDOS (obligatorios)

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `script` | string | Guion completo (mínimo 50 caracteres) | "Este producto cambió mi vida. Antes tenía problemas constantes..." |
| `ageRange` | string | Rango de edad del personaje | "18-25", "25-35", "35-45", "45+" |
| `gender` | string | Género del personaje | "male", "female", "non-binary" |
| `product` | string | Nombre del producto promocionado | "SmartClean Pro" |
| `room` | string | Ubicación de la grabación | "living room", "kitchen", "bedroom", "office", "bathroom" |
| `style` | string | Estilo del espacio | "modern", "cozy", "minimalist", "rustic", "industrial" |

### Campos OPCIONALES (mejoran la calidad)

| Campo | Tipo | Descripción | Opciones/Ejemplo |
|-------|------|-------------|------------------|
| `jsonFormat` | string | Formato del JSON | "standard" (default), "enhanced" |
| `continuationMode` | boolean | Modo continuación | true, false (default) |
| `voiceType` | string | Tipo de voz | "warm", "energetic", "conversational", "professional" |
| `energyLevel` | string | Nivel de energía | "low", "medium", "high" |
| `settingMode` | string | Modo de ubicación | "single" (default), "mixed" |
| `locations` | array | Ubicaciones múltiples (si settingMode="mixed") | ["living room", "kitchen"] |
| `cameraStyle` | string | Estilo de cámara | "handheld", "static", "smooth", "dynamic" |
| `timeOfDay` | string | Hora del día | "morning", "afternoon", "evening", "night" |
| `backgroundLife` | string | Actividad de fondo | "quiet", "busy", "ambient" |
| `productStyle` | string | Estilo del producto | "tech", "lifestyle", "beauty", "food" |
| `energyArc` | string | Arco de energía | "increasing", "steady", "decreasing" |
| `narrativeStyle` | string | Estilo narrativo | "testimonial", "tutorial", "storytelling" |
| `ethnicity` | string | Etnia del personaje | "Caucasian", "African American", "Hispanic", "Asian", etc. |
| `characterFeatures` | string | Características físicas | "athletic build, short curly hair" |
| `clothingDetails` | string | Descripción de vestimenta | "casual jeans and white t-shirt" |
| `accentRegion` | string | Región del acento | "American", "British", "Australian", etc. |

### Flujo de Conversación Recomendado para IA

```
IA: "Voy a ayudarte a generar segmentos UGC. Necesito la siguiente información:

1. ¿Cuál es tu guion? (mínimo 50 caracteres)
   Usuario: [guion]

2. ¿Qué edad tiene el personaje?
   - 18-25 años
   - 25-35 años
   - 35-45 años
   - 45+ años
   Usuario: [selección]

3. ¿Cuál es el género del personaje?
   - Masculino
   - Femenino
   - No binario
   Usuario: [selección]

4. ¿Cuál es el nombre del producto?
   Usuario: [nombre del producto]

5. ¿Dónde se graba el video?
   - Sala de estar
   - Cocina
   - Habitación
   - Oficina
   - Baño
   - Otro (especificar)
   Usuario: [selección]

6. ¿Qué estilo tiene el espacio?
   - Moderno
   - Acogedor
   - Minimalista
   - Rústico
   - Industrial
   Usuario: [selección]

¿Quieres configurar opciones avanzadas? (opcional)
   - Formato JSON (estándar/mejorado)
   - Tipo de voz
   - Nivel de energía
   - Características del personaje
   - Etc.
```

### Ejemplo de Petición Completa

```json
{
  "script": "Este producto ha transformado completamente mi rutina matutina. Antes pasaba horas luchando con mi cabello rebelde, pero ahora todo es mucho más fácil y rápido. Lo mejor es que los resultados duran todo el día.",
  "ageRange": "25-35",
  "gender": "female",
  "product": "SmartStyle Hair Tool",
  "room": "bathroom",
  "style": "modern",
  "jsonFormat": "enhanced",
  "voiceType": "warm",
  "energyLevel": "high",
  "ethnicity": "Hispanic",
  "characterFeatures": "shoulder-length wavy hair, expressive eyes",
  "clothingDetails": "casual white bathrobe",
  "timeOfDay": "morning"
}
```

---

## 📋 Endpoint 2: `/api/generate-plus` - Generación Mejorada

**Propósito:** Igual que `/api/generate` pero con más detalle y guarda los resultados en `runs/plus/`.

### Campos Idénticos

Acepta exactamente los mismos campos que `/api/generate`.

### Diferencias

- Genera descripciones más detalladas (500+ palabras vs 300+)
- Incluye microexpresiones faciales
- Mejor continuidad entre segmentos
- Guarda inputs y outputs en carpetas timestamped

### Cuándo Usar

- Cuando necesitas máxima calidad
- Para producción final
- Cuando quieres mantener un registro de las generaciones

---

## 📋 Endpoint 3: `/api/generate-continuation` - Modo Continuación

**Propósito:** Generar un segmento que continúe desde el frame final de un video anterior.

### Campos REQUERIDOS

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `imageUrl` | string | URL del frame final del video anterior | "https://example.com/frame.jpg" |
| `script` | string | Texto del siguiente segmento | "Y esto es solo el comienzo..." |
| `voiceProfile` | object | Perfil de voz del personaje anterior | Ver estructura abajo |
| `product` | string | Nombre del producto | "SmartClean Pro" |

### Campos OPCIONALES

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `previousSegment` | object | Información del segmento anterior |
| `maintainEnergy` | boolean | Mantener el nivel de energía |

### Estructura de voiceProfile

```json
{
  "type": "warm",
  "pitch": "medium",
  "pace": "moderate",
  "characteristics": "conversational and friendly",
  "energy": "high"
}
```

### Flujo de Conversación para IA

```
IA: "Voy a generar un segmento de continuación. Necesito:

1. URL de la imagen del frame final del video anterior
   Usuario: [URL]

2. El guion del siguiente segmento
   Usuario: [texto]

3. Información sobre la voz del personaje:
   - Tipo de voz: [warm/energetic/conversational]
   - Tono: [low/medium/high]
   - Ritmo: [slow/moderate/fast]

4. Nombre del producto
   Usuario: [producto]

¿Quieres mantener el mismo nivel de energía? (sí/no)
```

### Ejemplo de Petición

```json
{
  "imageUrl": "https://storage.example.com/final-frame-segment-1.jpg",
  "script": "Además, el producto viene con una garantía de por vida.",
  "voiceProfile": {
    "type": "warm",
    "pitch": "medium",
    "pace": "moderate",
    "characteristics": "conversational and friendly",
    "energy": "high"
  },
  "product": "SmartClean Pro",
  "maintainEnergy": true
}
```

---

## 📋 Endpoint 4: `/api/generate-new-cont` - Nueva Continuación con Avatares

**Propósito:** Similar a `/api/generate` pero con soporte para avatares animales.

### Campos REQUERIDOS (Base)

Los mismos campos obligatorios que `/api/generate`.

### Campos OPCIONALES ADICIONALES (Avatares Animales)

| Campo | Tipo | Descripción | Opciones |
|-------|------|-------------|----------|
| `useAnimalAvatar` | boolean | Usar avatar animal | true, false (default) |
| `animalPreset` | string | Tipo de animal | "tiger", "monkey", "fish", "custom" |
| `animalVoiceStyle` | string | Estilo de voz del animal | "narrator", "playful", "deep-resonant" |
| `anthropomorphic` | boolean | ¿Tiene características humanas? | true, false |

### Flujo para Avatar Animal

```
IA: "¿Quieres usar un avatar animal en lugar de humano?

Si es SÍ:
1. ¿Qué tipo de animal?
   - Tigre
   - Mono
   - Pez
   Usuario: [selección]

2. ¿Qué estilo de voz?
   - Narrador (profesional)
   - Juguetón (energético)
   - Resonante profundo (autoritario)
   Usuario: [selección]

3. ¿El animal tiene características humanas? (usa ropa, gestos humanos)
   Usuario: [sí/no]
```

### Ejemplo con Avatar Animal

```json
{
  "script": "Hola amigos, soy Tony el Tigre y les voy a contar un secreto increíble sobre este producto.",
  "product": "JunglePower Vitamins",
  "room": "jungle clearing",
  "style": "natural",
  "useAnimalAvatar": true,
  "animalPreset": "tiger",
  "animalVoiceStyle": "narrator",
  "anthropomorphic": true,
  "ageRange": "adult",
  "gender": "male"
}
```

---

## 🎯 Validaciones Importantes

### Todas las peticiones deben cumplir:

1. ✅ `script` tiene mínimo 50 caracteres
2. ✅ Campos requeridos presentes y no vacíos
3. ✅ Valores de opciones son válidos (según las opciones listadas)
4. ✅ Si `settingMode="mixed"`, array `locations` debe tener al menos 1 elemento

### Respuestas de Error Comunes

```json
// Script muy corto
{
  "error": "Script must be at least 50 characters long"
}

// Campos faltantes (continuation)
{
  "error": "Missing required fields: imageUrl, script, voiceProfile, and product are required"
}

// Rate limit excedido
{
  "error": "Too many requests",
  "retry_after": 60
}
```

---

## 🤖 Template de Prompt para IA

```
Eres un asistente especializado en generar segmentos UGC para Veo 3. 

Cuando el usuario quiera generar guiones:

1. SIEMPRE pregunta por los campos REQUERIDOS uno por uno
2. Ofrece opciones claras para seleccionar
3. Explica brevemente para qué sirve cada campo
4. DESPUÉS pregunta si quiere configurar opciones avanzadas
5. Valida que el script tenga mínimo 50 caracteres
6. Construye el JSON y envía la petición
7. Muestra los resultados de forma clara

Endpoints disponibles:
- /api/generate: Uso general
- /api/generate-plus: Máxima calidad (recomendado para producción)
- /api/generate-continuation: Cuando hay un video previo
- /api/generate-new-cont: Con soporte para avatares animales

IMPORTANTE: 
- No inventes valores, siempre pregunta al usuario
- Valida los campos antes de enviar
- Si hay error, explica qué falta o está mal
```

---

## 📊 Tabla Resumen Rápida

| Endpoint | Uso Principal | Campos Únicos |
|----------|---------------|---------------|
| `/api/generate` | Uso general | continuationMode |
| `/api/generate-plus` | Alta calidad, con logs | Guarda en runs/plus/ |
| `/api/generate-continuation` | Continuar video existente | imageUrl, voiceProfile |
| `/api/generate-new-cont` | Con avatares animales | useAnimalAvatar, animalPreset |

---

## 🔗 Siguiente Paso

Después de generar segmentos, puedes:
1. Generar videos con `/api/generate-videos` o `/api/generate-videos-plus`
2. Descargar segmentos en ZIP con `/api/download` o `/api/download-plus`

Ver [API_DOCS.md](./API_DOCS.md) para ejemplos completos.
