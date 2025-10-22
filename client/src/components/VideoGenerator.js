import React, { useState } from 'react';
import { generateVideos } from '../api/client';

function VideoGenerator({ segments }) {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleGenerateVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateVideos(segments);
      setVideos(result.videos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCostDisplay = () => {
    return `$${(segments.length * 8 * 0.75).toFixed(2)} (8 seconds × $0.75 per second)`;
  };

  return (
    <div className="video-generator">
      <h3>Generación de Video</h3>
      
      <div className="video-info">
        <p><strong>Listo para generar {segments.length} segmentos de video</strong></p>
        
        
        <p className="video-cost">Costo estimado: {getCostDisplay()}</p>
      </div>

      <button 
        className="generate-videos-button"
        onClick={handleGenerateVideos}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Generar descripciones de video'}
      </button>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {videos && (
        <div className="videos-results">
          <h4>Resultados de descripciones de video</h4>
           <p className="video-status">
             ✅ Descripciones generadas para los {videos.length} segmentos
           </p>
          
          
          <button 
            className="toggle-details-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>

          {showDetails && (
            <div className="video-details">
              {videos.map((video, index) => (
                <div key={index} className="video-segment">
                  <h5>Segmento {video.segmentNumber}</h5>
                  <div className="video-prompt">
                    <strong>Solicitud:</strong>
                    <pre>{video.prompt}</pre>
                  </div>
                  {video.videoDescription && (
                    <div className="video-description">
                      <strong>Descripción del Video:</strong>
                      <pre>{video.videoDescription}</pre>
                    </div>
                  )}
                  {video.duration && (
                    <p className="video-duration">Duración: {video.duration}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="veo3-note">
            <p><strong>Nota:</strong> Esto genera descripciones detalladas de video que pueden ser usadas con la API Veo 3 de Google cuando esté disponible.</p>
            <p>Las descripciones incluyen ángulos de cámara, estados del personaje, tiempos de diálogo y continuidad de escena para una generación de video sin interrupciones.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoGenerator;
