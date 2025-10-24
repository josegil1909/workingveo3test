Documenta únicamente lo necesario para replicar en n8n el flujo que genera un guion segmentado en múltiples cortes para un video. Usa el archivo `logica.md` como único entregable y cubre sólo los apartados siguientes:

1. **Resumen del flujo**
    - Objetivo del proceso y resultado final esperado.
    - Endpoints o servicios actuales que se sustituirán por nodos n8n.

2. **Entradas requeridas**
    - Campos obligatorios del payload y validaciones mínimas.
    - Parámetros opcionales que alteran la cantidad o estilo de los cortes.

3. **Pasos del workflow en n8n**
    - Secuencia numerada de nodos desde la recepción del guion hasta la respuesta.
    - Para cada paso indica tipo de nodo, propósito y datos que consume/produce.
    - Incluye sólo bifurcaciones indispensables para preservar la continuidad entre segmentos.

4. **Salidas y verificaciones finales**
    - Estructura resumida de la respuesta (segmentos y metadatos clave).
    - Chequeos mínimos para garantizar que los cortes encajan al construir el video.

5. **Notas operativas**
    - Credenciales o variables de entorno imprescindibles.
    - Límites relevantes (tiempo de procesamiento, cuotas) y fallback básico recomendado.

6. **Checklist de despliegue**
    - Pasos breves para probar el flujo en n8n con un guion de ejemplo.
    - Registro de fecha/autor cuando se actualice el documento.