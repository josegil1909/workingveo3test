# Implementación de Veo 3.1 - Generación Real de Videos

## ✅ Estado: API Pública Disponible

La API de **Veo 3.1** de Google está ahora públicamente disponible y ha sido integrada en el proyecto.

## 📚 Documentación Oficial

- **Gemini API**: https://ai.google.dev/gemini-api/docs/video
- **Vertex AI**: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation
- **Quickstart Colab**: https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Get_started_Veo.ipynb

## 🔧 Configuración Requerida

### Opción 1: Gemini API (Recomendado para desarrollo)

```bash
GOOGLE_GEMINI_API_KEY=tu_api_key_aqui
```

Obtén tu API key en: https://aistudio.google.com/apikey

### Opción 2: Vertex AI (Para producción)

```bash
VERTEX_PROJECT_ID=tu-proyecto-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/credenciales.json
```

## 🎬 Modelos Disponibles

### Veo 3.1 (Latest - Preview)

- **Modelo**: `veo-3.1-generate-preview`
- **Audio**: Nativo (incluye diálogos y efectos de sonido)
- **Resolución**: 720p, 1080p (solo 8s en 1080p)
- **Duración**: 4, 6 u 8 segundos
- **Aspect Ratios**: 16:9, 9:16
- **Frame Rate**: 24fps

### Veo 3.1 Fast (Preview)

- **Modelo**: `veo-3.1-fast-generate-preview`
- **Optimizado para**: Velocidad y casos de uso empresarial
- **Mismo soporte de audio y resolución**

### Características Especiales de Veo 3.1

1. **Video Extension**: Extender videos generados previamente por Veo
2. **Frame-Specific Generation**: Especificar primer y último frame
3. **Reference Images**: Hasta 3 imágenes de referencia para guiar el contenido
4. **Audio Nativo**: Diálogos, efectos de sonido y música ambiental

## 📦 Paquetes Instalados

```json
{
  "@google/genai": "^1.28.0",          // SDK oficial para Veo 3.1
  "@google/generative-ai": "^0.21.0",  // Para Gemini (descripción de videos)
  "@google-cloud/vertexai": "^1.9.0"   // Para Vertex AI (opcional)
}
```

## 🛠️ Implementación en veo3Service.js

### Método Principal: `generateActualVideo()`

```javascript
const result = await veo3Service.generateActualVideo(
  "A close up of two people staring at a cryptic drawing on a wall",
  {
    aspectRatio: '16:9',
    durationSeconds: 8,
    resolution: '720p',
    negativePrompt: 'cartoon, drawing, low quality',
    personGeneration: 'allow_adult'
  }
);
```

### Parámetros Soportados

| Parámetro | Tipo | Valores | Default | Descripción |
|-----------|------|---------|---------|-------------|
| `prompt` | string | cualquier texto | required | Descripción del video |
| `aspectRatio` | string | "16:9", "9:16" | "16:9" | Relación de aspecto |
| `durationSeconds` | number | 4, 6, 8 | 8 | Duración del video |
| `resolution` | string | "720p", "1080p" | "720p" | Resolución (1080p solo 8s) |
| `negativePrompt` | string | texto | - | Qué evitar generar |
| `personGeneration` | string | "allow_adult", "dont_allow" | "allow_adult" | Control de personas |
| `image` | Object | imagen | - | Frame inicial (opcional) |
| `lastFrame` | Object | imagen | - | Frame final para interpolación |
| `referenceImages` | Array | hasta 3 imgs | - | Imágenes de referencia |
| `video` | Object | video | - | Video a extender |

## 🎯 Proceso de Generación

1. **Inicio**: Se envía la solicitud a la API
2. **Long-Running Operation**: Se recibe un operation ID
3. **Polling**: Se consulta el estado cada 10 segundos
4. **Timeout**: Máximo 10 minutos (60 polls)
5. **Descarga**: Se descarga el MP4 generado
6. **Guardado**: Se guarda como `veo3_[timestamp].mp4`

## 📝 Ejemplo de Prompt para UGC

```javascript
const prompt = `
UGC Video Segment 1 of 4
Duration: 8 seconds

CHARACTER:
Young woman, 25-30, casual wear, enthusiastic expression

DIALOGUE: "Guys, you NEED to try this product!"

SYNCHRONIZED ACTIONS:
0:00 - Looks directly at camera
0:02 - Holds up product enthusiastically
0:05 - Genuine smile and nod
0:07 - Points at product feature

CAMERA:
Medium shot, eye level, handheld feel

SCENE:
Natural lighting, home environment, window light from left

Style: Authentic UGC content, casual and relatable
`;
```

## 💡 Buenas Prácticas para Prompts

### Estructura Recomendada:

1. **Subject**: Qué o quién aparece (persona, objeto, animal)
2. **Action**: Qué hace el sujeto (caminar, hablar, sonreír)
3. **Style**: Estilo visual (UGC, cinematic, film noir)
4. **Camera**: Posición y movimiento (medium shot, tracking)
5. **Composition**: Encuadre (wide shot, close-up)
6. **Ambiance**: Iluminación y color (warm tones, natural light)

### Para Audio:

- **Diálogos**: Usar comillas. Ej: "This must be it," he murmured.
- **Efectos**: Describir explícitamente. Ej: tires screeching loudly
- **Ambiente**: Describir soundscape. Ej: A faint, eerie hum resonates

### Negative Prompts:

- ❌ NO usar lenguaje instructivo: "no walls"
- ✅ Describir qué evitar: "wall, frame, dark, stormy"

## 🚀 Uso en el Sistema

### 1. Generar Video Individual

```javascript
import veo3Service from './api/services/veo3Service.js';

const video = await veo3Service.generateActualVideo(
  "Your video prompt here",
  { 
    durationSeconds: 8,
    resolution: '720p'
  }
);
```

### 2. Generar Videos para Segmentos

```javascript
// El método actual genera descripciones
const descriptions = await veo3Service.generateVideosForAllSegments(segments);

// Para generar videos reales, iterar y llamar generateActualVideo()
for (const segment of segments) {
  const prompt = veo3Service.createVideoPrompt(segment);
  const video = await veo3Service.generateActualVideo(prompt);
}
```

## ⏱️ Latencia y Costos

### Latencia

- **Mínimo**: 11 segundos
- **Máximo**: 6 minutos (durante picos de tráfico)
- **Promedio**: 1-2 minutos

### Retención

- Videos se guardan en el servidor por **2 días**
- Descargar dentro de 2 días para guardar copia local
- Videos extendidos se tratan como nuevos

### Watermarking

- Todos los videos tienen marca de agua SynthID
- Verificables en: https://deepmind.google/science/synthid/

### Filtros de Seguridad

- Safety filters automáticos
- Chequeo de memorización
- Protección de privacidad y copyright
- Veo 3.1 puede bloquear videos por audio (no se cobra si se bloquea)

## 🌍 Limitaciones Regionales

### EU, UK, CH, MENA:

- **Veo 3**: Solo `allow_adult`
- **Veo 2**: `dont_allow` y `allow_adult` (default: `dont_allow`)

## 📊 Rate Limits

Consulta: https://ai.google.dev/gemini-api/docs/rate-limits

## 🔜 Próximos Pasos

1. ✅ Instalación de SDK (`@google/genai`)
2. ✅ Implementación de `generateActualVideo()`
3. ⏳ Pruebas con API key real
4. ⏳ Integración con endpoints existentes
5. ⏳ Manejo de archivos generados (storage)
6. ⏳ UI para mostrar progreso de generación
7. ⏳ Implementación de video extension
8. ⏳ Soporte para reference images

## 🐛 Troubleshooting

### Error: "API key not found"

- Verifica que `GOOGLE_GEMINI_API_KEY` esté en `.env`
- Obtén key en: https://aistudio.google.com/apikey

### Error: "Video generation timed out"

- Incrementa `maxPolls` en el código
- Verifica el estado de la API de Google

### Error: "Vertex AI not initialized"

- Para Vertex AI se necesita `VERTEX_PROJECT_ID`
- O usa Gemini API con `GOOGLE_GEMINI_API_KEY`

### Videos bloqueados por audio

- Veo 3.1 a veces bloquea por safety filters de audio
- Simplifica el prompt de audio o usa negative prompts
- No se cobra si el video es bloqueado

## 📚 Recursos Adicionales

- **Veo Prompt Guide**: https://ai.google.dev/gemini-api/docs/video#veo-prompt-guide
- **Pricing**: https://ai.google.dev/gemini-api/docs/pricing#veo-3.1
- **Cookbook**: https://github.com/google-gemini/cookbook
- **Community**: https://discuss.ai.google.dev/
- **DeepMind Veo**: https://deepmind.google/models/veo/
