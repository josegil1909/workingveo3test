# 📚 Índice de Documentación

Guía completa de todos los documentos disponibles en este proyecto.

## 🎯 Para Empezar

### [QUICKSTART.md](./QUICKSTART.md) ⭐

**Lee esto primero si es tu primera vez.**
- Instalación en 5 pasos
- Configuración básica
- Primer uso
- Troubleshooting rápido

**Tiempo estimado:** 5-10 minutos

---

## 📖 Documentación Principal

### [README.md](./README.md)

**Documentación general del proyecto.**
- Funcionalidades completas
- Instalación detallada
- Estructura del proyecto
- Scripts de desarrollo
- Despliegue (Heroku, Cloud Run, Docker)
- Seguridad
- Testing
- Contribución

**Para quién:** Todos los usuarios

---

### [API_DOCS.md](./API_DOCS.md)

**Referencia completa de la API REST.**
- 5 endpoints documentados con ejemplos
- Parámetros detallados
- Códigos de respuesta
- Ejemplos en curl, JavaScript y Python
- Rate limiting
- Estructura de errores

**Para quién:** Desarrolladores que integrarán con la API

**Endpoints disponibles:**
- `POST /api/generate` - Generación estándar
- `POST /api/generate-plus` - Generación mejorada
- `POST /api/generate-continuation` - Modo continuación
- `POST /api/generate-newcont` - Nueva continuación
- `GET /api/health` - Health check

---

### [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md)

**Guía completa de configuración de Google Veo 3.**
- Opción A: Google Gemini API (simple)
- Opción B: Vertex AI (empresarial)
- Comparación entre ambas opciones
- Troubleshooting específico

---

### [VEO3_IMPLEMENTATION.md](./VEO3_IMPLEMENTATION.md) 🆕

**Implementación completa de Veo 3.1 para generación real de videos.**
- ✅ Estado: API pública disponible
- 📚 Documentación oficial de Google
- 🔧 Configuración de API keys
- 🎬 Modelos disponibles (Veo 3.1, Veo 3.1 Fast)
- 📦 Paquetes instalados
- 🛠️ Uso del servicio veo3Service.js
- 🎯 Parámetros de generación
- 📝 Guía de prompts para UGC
- 💡 Buenas prácticas
- ⏱️ Latencia y costos
- 🐛 Troubleshooting

**Para quién:** Desarrolladores implementando generación de videos

**Características principales:**
- Generación de videos MP4 de 720p/1080p
- Audio nativo (diálogos, efectos, música)
- Duraciones de 4, 6 u 8 segundos
- Soporte para reference images (hasta 3)
- Video extension
- Frame-to-frame interpolation
- Costos estimados
- Seguridad y rotación de credenciales

**Para quién:** Usuarios configurando Google Cloud

---

### [FORMATTING.md](./FORMATTING.md) 🆕

**Guía completa de formateo con Biome y Markdownlint.**

- Comandos de formateo para JavaScript y Markdown
- Configuración de Biome y Markdownlint
- Workflow recomendado
- Integración con VSCode
- Troubleshooting común
- Tips y trucos

**Para quién:** Desarrolladores que contribuyen al proyecto

**Herramientas cubiertas:**

- Biome: JavaScript, TypeScript, JSON
- Markdownlint: Archivos Markdown

---

## 🔧 Documentación Técnica

### [CLAUDE.md](./CLAUDE.md)

**Contexto técnico para Claude Code.**
- Arquitectura del proyecto
- Comandos disponibles
- Estructura de carpetas
- Templates de prompts
- Flujo de procesamiento

**Para quién:** Claude Code AI y desarrolladores que quieren entender la arquitectura

---

### [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)

**Resumen de todos los cambios realizados.**
- Qué se configuró
- Archivos nuevos, modificados y eliminados
- Próximos pasos
- Estado actual del proyecto

**Para quién:** Mantenedores del proyecto

---

## 📝 Archivos de Configuración

### [.env.example](./.env.example)

**Plantilla de variables de entorno.**

```bash
cp .env.example .env
# Luego edita .env con tus claves
```

### [biome.json](./biome.json)

**Configuración de formateo y linting.**
- Indentación: 2 espacios
- Comillas simples
- Line width: 100 caracteres

### [package.json](./package.json)

**Dependencias y scripts del proyecto.**
- Scripts de desarrollo
- Scripts de Biome
- Dependencias

---

## 📂 Documentación por Tema

### Instalación y Configuración

1. [QUICKSTART.md](./QUICKSTART.md) - Inicio rápido
2. [README.md](./README.md) - Instalación detallada
3. [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md) - Configurar Google

### Uso de la API

1. [API_DOCS.md](./API_DOCS.md) - Referencia completa
2. [README.md](./README.md) - Sección "Endpoints de la API"

### Desarrollo

1. [README.md](./README.md) - Scripts de desarrollo
2. [CLAUDE.md](./CLAUDE.md) - Arquitectura
3. [biome.json](./biome.json) - Formateo

### Despliegue

1. [README.md](./README.md) - Sección "Despliegue"
2. [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md) - Vertex AI para producción

### Troubleshooting

1. [QUICKSTART.md](./QUICKSTART.md) - Problemas comunes
2. [README.md](./README.md) - Sección "Troubleshooting"
3. [GOOGLE_VEO3_SETUP.md](./GOOGLE_VEO3_SETUP.md) - Errores de Google Cloud

---

## 🗺️ Flujo de Lectura Recomendado

### Para Nuevos Usuarios

```
1. QUICKSTART.md          (5 min)
2. README.md              (15 min)
3. API_DOCS.md            (10 min)
4. GOOGLE_VEO3_SETUP.md   (si necesitas configuración avanzada)
```

### Para Desarrolladores

```
1. README.md              (completo)
2. CLAUDE.md              (arquitectura)
3. API_DOCS.md            (referencia)
4. Explorar código en api/ y client/
```

### Para DevOps/SysAdmin

```
1. GOOGLE_VEO3_SETUP.md   (Vertex AI)
2. README.md              (sección Despliegue)
3. .env.example           (variables)
4. SETUP_SUMMARY.md       (estado del proyecto)
```

---

## 📊 Tablas de Referencia Rápida

### Comandos Esenciales

| Comando | Descripción |
|---------|-------------|
| `pnpm run dev` | Iniciar en desarrollo |
| `pnpm start` | Iniciar en producción |
| `pnpm run check` | Formatear y lint |
| `pnpm run build` | Construir cliente |

### Endpoints API

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/health` | GET | Health check |
| `/api/generate` | POST | Generación estándar |
| `/api/generate-plus` | POST | Generación mejorada |
| `/api/generate-continuation` | POST | Continuación |
| `/api/generate-new-cont` | POST | Nueva continuación |
| `/api/generate-videos` | POST | Generar videos (estándar) |
| `/api/generate-videos-plus` | POST | Generar videos (plus) |
| `/api/download` | POST | Descargar ZIP (estándar) |
| `/api/download-plus` | POST | Descargar ZIP (plus) |

### Variables de Entorno Clave

| Variable | Requerido | Descripción |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | ✅ | API key de OpenAI |
| `GOOGLE_GEMINI_API_KEY` | ✅ | API key de Gemini (opción simple) |
| `GOOGLE_APPLICATION_CREDENTIALS` | ❌ | Service Account (opción empresarial) |
| `PORT` | ❌ | Puerto del servidor (default: 3001) |

---

## 🔗 Enlaces Útiles

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Google Cloud Console](https://console.cloud.google.com)
- [Biome Documentation](https://biomejs.dev)
- [Express Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)

---

## ❓ ¿No encuentras lo que buscas?

1. **Busca en el README:** La mayoría de preguntas están respondidas ahí
2. **Revisa API_DOCS:** Para detalles técnicos de los endpoints
3. **Lee GOOGLE_VEO3_SETUP:** Para problemas de configuración de Google
4. **Consulta QUICKSTART:** Para problemas de instalación inicial

---

## 📝 Última Actualización

**Fecha:** 3 de Noviembre de 2025

**Versión del proyecto:** 1.0.0

**Documentos disponibles:** 8 archivos principales

---

**¡Feliz desarrollo!** 🚀

Si encuentras algo que falta o necesita mejora en la documentación, por favor abre un issue o contribuye con un PR.
