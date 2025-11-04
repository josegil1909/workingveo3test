import React, { useState } from 'react';
import { generateNewCont } from '../api/clientNewCont';
import DownloadButton from './DownloadButton';
import ResultsDisplay from './ResultsDisplay';

function NewContinuationMode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [formData, setFormData] = useState({
    script: '',
    ageRange: '25-34',
    gender: 'female',
    product: '',
    voiceType: 'warm-friendly',
    energyLevel: '80',
    jsonFormat: 'standard',
    settingMode: 'single',
    room: 'living room',
    style: 'casual and friendly',
    locations: [],
    cameraStyle: 'static-handheld',
    timeOfDay: 'morning',
    backgroundLife: false,
    productStyle: 'natural',
    energyArc: 'consistent',
    narrativeStyle: 'direct-review',
    ethnicity: '',
    characterFeatures: '',
    clothingDetails: '',
    accentRegion: 'neutral-american',
    // Animal avatar controls
    useAnimalAvatar: true,
    animalPreset: 'tiger',
    animalVoiceStyle: 'narrator',
    anthropomorphic: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await generateNewCont(formData);
      setResults({ ...response, settings: formData });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="continuation-mode-container">
      <div className="continuation-header">
        <h2>Modo de Nueva Continuación</h2>
        <p className="section-description">
          Modo de continuación aislada con soporte para avatares de animales.
        </p>
      </div>

      {!results ? (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-section">
            <h3>Avatar Animal</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="useAnimalAvatar"
                    checked={formData.useAnimalAvatar}
                    onChange={handleChange}
                  />
                  Usar Avatar Animal
                </label>
              </div>
              <div className="form-group">
                <label>Preajuste</label>
                <select name="animalPreset" value={formData.animalPreset} onChange={handleChange}>
                  <option value="tiger">Tigre (poderoso, elegante)</option>
                  <option value="monkey">Mono (juguetón, ágil)</option>
                  <option value="fish">Pez (calmo, fluido)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estilo de Voz</label>
                <select
                  name="animalVoiceStyle"
                  value={formData.animalVoiceStyle}
                  onChange={handleChange}
                >
                  <option value="narrator">Narrador (neutral, articulado)</option>
                  <option value="deep-resonant">Profundo y Resonante</option>
                  <option value="playful">Juguetón y Ligero</option>
                  <option value="calm-soothing">Calmo y Reconfortante</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="anthropomorphic"
                    checked={formData.anthropomorphic}
                    onChange={handleChange}
                  />
                  Antropomórfico (gestos similares a humanos)
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Producto y Guion</h3>
            <div className="form-group">
              <label>Producto *</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Guion *</label>
              <textarea
                name="script"
                value={formData.script}
                onChange={handleChange}
                rows={8}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Generando...' : 'Generar Segmentos'}
          </button>
        </form>
      ) : (
        <>
          <ResultsDisplay results={results} />
          <DownloadButton segments={results.segments} metadata={results.metadata} />
          <button className="back-button" onClick={() => setResults(null)}>
            Generar Nuevo Guion
          </button>
        </>
      )}

      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default NewContinuationMode;
