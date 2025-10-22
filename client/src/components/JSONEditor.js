import React, { useState, useEffect } from 'react';

function JSONEditor({ segment, onUpdate, onClose }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setJsonText(JSON.stringify(segment, null, 2));
    setHasChanges(false);
    setError(null);
  }, [segment]);

  const handleChange = (e) => {
    setJsonText(e.target.value);
    setHasChanges(true);
    setError(null);
  };

  const validateAndSave = () => {
    try {
      const parsed = JSON.parse(jsonText);

      // Validaciones básicas
      if (!parsed.segment_info) {
        throw new Error('segment_info es obligatorio');
      }
      if (!parsed.character_description) {
        throw new Error('character_description es obligatorio');
      }
      if (!parsed.action_timeline) {
        throw new Error('action_timeline es obligatorio');
      }

      // Validación recuento de palabras
      const physical = parsed.character_description?.physical || '';
      const clothing = parsed.character_description?.clothing || '';
      const countWords = (text) =>
        text.split(/\s+/).filter((w) => w.length > 0).length;

      const physicalWords = countWords(physical);
      const clothingWords = countWords(clothing);

      if (physicalWords < 100) {
        setError(
          `Advertencia: descripción física tiene ${physicalWords} palabras (mínimo 100 recomendado)`
        );
      }
      if (clothingWords < 100) {
        setError(
          `Advertencia: descripción de vestimenta tiene ${clothingWords} palabras (mínimo 100 recomendado)`
        );
      }

      onUpdate(parsed);
      setHasChanges(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError('JSON inválido: ' + err.message);
    }
  };

  const getStats = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const countWords = (text) =>
        text ? text.split(/\s+/).filter((w) => w.length > 0).length : 0;
      return {
        physical: countWords(parsed.character_description?.physical),
        clothing: countWords(parsed.character_description?.clothing),
        voice: countWords(parsed.character_description?.voice_matching),
        dialogue: countWords(parsed.action_timeline?.dialogue),
        environment: countWords(parsed.scene_continuity?.environment),
      };
    } catch {
      return null;
    }
  };

  const stats = getStats();

  return (
    <div className="json-editor-modal">
      <div className="json-editor-container">
        <div className="json-editor-header">
          <h3>Editar segmento {segment.segment_info?.segment_number || ''}</h3>
          <div className="json-editor-actions">
            <button className="format-json-btn" onClick={formatJSON} title="Formatear JSON">
              Formatear
            </button>
            <button
              className="save-json-btn"
              onClick={validateAndSave}
              disabled={!hasChanges}
              title="Guardar cambios"
            >
              Guardar cambios
            </button>
            <button className="close-json-btn" onClick={onClose} title="Cerrar editor">
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className={`json-error ${error.includes('Advertencia') ? 'warning' : 'error'}`}>
            {error}
          </div>
        )}

        <div className="json-editor-content">
          <div className="json-editor-wrapper">
            <textarea
              className="json-editor-textarea"
              value={jsonText}
              onChange={handleChange}
              spellCheck={false}
              wrap="off"
            />
            <div className="line-numbers">
              {jsonText.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          </div>

          {stats && (
            <div className="json-stats">
              <h4>Recuento de palabras</h4>
              <div className="stat-grid">
                <div className="stat-item">
                  <span>Físico:</span>
                  <span className={stats.physical < 100 ? 'low' : 'good'}>
                    {stats.physical} palabras
                  </span>
                </div>
                <div className="stat-item">
                  <span>Vestimenta:</span>
                  <span className={stats.clothing < 100 ? 'low' : 'good'}>
                    {stats.clothing} palabras
                  </span>
                </div>
                <div className="stat-item">
                  <span>Voz:</span>
                  <span className={stats.voice < 50 ? 'low' : 'good'}>
                    {stats.voice} palabras
                  </span>
                </div>
                <div className="stat-item">
                  <span>Diálogo:</span>
                  <span>{stats.dialogue} palabras</span>
                </div>
                <div className="stat-item">
                  <span>Entorno:</span>
                  <span className={stats.environment < 150 ? 'low' : 'good'}>
                    {stats.environment} palabras
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="json-editor-tips">
          <p><strong>Consejos:</strong></p>
          <ul>
            <li>Usa Ctrl+F para buscar texto</li>
            <li>Haz clic en "Formatear" para autoformatear JSON</li>
            <li>Obligatorio: segment_info, character_description, action_timeline</li>
            <li>Recuento mínimo de palabras: Physical (100), Clothing (100), Environment (150)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JSONEditor;
