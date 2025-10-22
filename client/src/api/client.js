export async function generateSegments(data) {
  console.log('[Cliente API] Llamando a /api/generate con:', data);
  
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  console.log('[Cliente API] Estado de la respuesta:', response.status);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('[Cliente API] Respuesta de error:', error);
    throw new Error(error.message || 'No se pudieron generar los segmentos');
  }
  
  const result = await response.json();
  console.log('[Cliente API] Respuesta exitosa:', result);
  return result;
}

export async function downloadSegments(segments) {
  console.log('[Cliente API] Descargando segmentos:', segments.length);
  
  const response = await fetch('/api/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ segments }),
  });
  
  if (!response.ok) {
    console.error('[Cliente API] Error al descargar:', response.status);
    throw new Error('No se pudieron descargar los segmentos');
  }
  
  console.log('[Cliente API] Descarga exitosa');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'veo3-segments.zip';
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function generateVideos(segments) {
  console.log('[Cliente API] Generando videos para segmentos:', segments.length);
  
  const response = await fetch('/api/generate-videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ segments }),
  });
  
  console.log('[Cliente API] Estado de la respuesta de generación de video:', response.status);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('[Cliente API] Error en la generación de video:', error);
    throw new Error(error.message || 'No se pudieron generar los videos');
  }
  
  const result = await response.json();
  console.log('[Cliente API] Éxito en la generación de video:', result);
  return result;
}

export async function generateContinuation(data) {
  console.log('[API Client] Calling /api/generate-continuation with:', data);
  
  const response = await fetch('/api/generate-continuation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  console.log('[API Client] Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('[API Client] Error response:', error);
    throw new Error(error.message || 'No se pudo generar la continuación');
  }
  
  const result = await response.json();
  console.log('[API Client] Success response:', result);
  return result;
}
