import React, { useState, useEffect } from 'react';
import SettingsDisplay from './SettingsDisplay';
import JSONEditor from './JSONEditor';

function ResultsDisplay({ results }) {
  const { segments, metadata, settings } = results;
  const [displayedSegments, setDisplayedSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingSegmentIndex, setEditingSegmentIndex] = useState(null);
  const [localSegments, setLocalSegments] = useState([]);

  // Animar segmentos apareciendo uno a uno
  useEffect(() => {
    if (segments && segments.length > 0 && currentIndex < segments.length) {
      const timer = setTimeout(() => {
        setDisplayedSegments(prev => [...prev, segments[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 500); // 500ms de demora entre segmentos

      return () => clearTimeout(timer);
    }
  }, [segments, currentIndex]);

  // Reiniciar cuando cambian los resultados
  useEffect(() => {
    setDisplayedSegments([]);
    setCurrentIndex(0);
    setLocalSegments(segments || []);
  }, [segments]);

  const handleSegmentUpdate = (index, updatedSegment) => {
    const newSegments = [...localSegments];
    newSegments[index] = updatedSegment;
    setLocalSegments(newSegments);

    const newDisplayed = [...displayedSegments];
    newDisplayed[index] = updatedSegment;
    setDisplayedSegments(newDisplayed);

    setEditingSegmentIndex(null);
  };

  return (
    <div className="results-container">
  <h2>Segmentos generados</h2>

      {/* Mostrar configuración usada */}
      {settings && <SettingsDisplay settings={settings} />}

      <div className="metadata">
        <p><strong>Total de segmentos:</strong> {metadata.totalSegments}</p>
        <p><strong>Duración estimada:</strong> {metadata.estimatedDuration} segundos</p>
        <p><strong>ID de personaje:</strong> {metadata.characterId}</p>
        {currentIndex < segments.length && (
          <p className="generation-progress">
            <strong>Generando:</strong> {currentIndex + 1} de {segments.length} segmentos...
          </p>
        )}
      </div>

      <div className="segments-list">
        {displayedSegments.map((segment, index) => (
          <div
            key={index}
            className="segment-card animate-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="segment-header">
              <h3>Segmento {segment.segment_info?.segment_number || index + 1}</h3>
              <div className="segment-header-actions">
                <button
                  className="edit-json-btn"
                  onClick={() => setEditingSegmentIndex(index)}
                  title="Editar JSON"
                >
                  ✏️ Editar JSON
                </button>
                <span className="segment-duration">
                  {segment.segment_info?.duration || '00:00-00:08'}
                </span>
              </div>
            </div>

            <div className="segment-content">
              <div className="segment-field">
                <strong>Guion:</strong>
                <p className="script-text">{segment.action_timeline?.dialogue || 'N/A'}</p>
                <span className="word-count">
                  {segment.action_timeline?.dialogue?.split(/\s+/).length || 0} palabras
                </span>
              </div>

              <div className="segment-field">
                <strong>Ubicación:</strong> {segment.segment_info?.location || 'N/A'}
              </div>

              <div className="segment-field">
                <strong>Cámara:</strong> {segment.scene_continuity?.camera_position || 'N/A'}
              </div>

              <div className="segment-field">
                <strong>Estado del personaje:</strong>
                <p className="character-state">
                  {segment.character_description?.current_state
                    ? segment.character_description.current_state.substring(0, 150) + '...'
                    : 'N/A'}
                </p>
              </div>

              {segment.character_description?.voice_matching && (
                <div className="segment-field">
                  <strong>Coincidencia de voz:</strong>
                  <p className="voice-matching">
                    {segment.character_description.voice_matching.substring(0, 100)}...
                  </p>
                </div>
              )}

              <details className="json-details">
                <summary>Ver JSON completo</summary>
                <pre className="json-content">{JSON.stringify(segment, null, 2)}</pre>
              </details>
            </div>
          </div>
        ))}
      </div>

      {editingSegmentIndex !== null && (
        <JSONEditor
          segment={displayedSegments[editingSegmentIndex]}
          onUpdate={(updated) => handleSegmentUpdate(editingSegmentIndex, updated)}
          onClose={() => setEditingSegmentIndex(null)}
        />
      )}
    </div>
  );
}

export default ResultsDisplay;
