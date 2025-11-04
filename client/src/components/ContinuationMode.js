import React, { useState } from 'react';
import { generateSegments } from '../api/client';
import DownloadButton from './DownloadButton';
import ResultsDisplay from './ResultsDisplay';

function ContinuationMode() {
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
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSettingModeChange = (mode) => {
    setFormData({
      ...formData,
      settingMode: mode,
      locations: mode === 'single' ? [] : getDefaultLocations(mode),
    });
  };

  const getDefaultLocations = (mode) => {
    switch (mode) {
      case 'home-tour':
        return ['living room', 'kitchen', 'bedroom', 'bathroom'];
      case 'indoor-outdoor':
        return ['living room', 'porch', 'backyard', 'kitchen'];
      default:
        return [];
    }
  };

  const handleLocationChange = (index, value) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({ ...formData, locations: newLocations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await generateSegments({
        ...formData,
        continuationMode: true,
      });
      setResults({
        ...response,
        settings: formData,
      });
    } catch (err) {
      setError(err.message || 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = [
    { value: 'living room', label: 'Sala de estar' },
    { value: 'kitchen', label: 'Cocina' },
    { value: 'bedroom', label: 'Dormitorio' },
    { value: 'bathroom', label: 'Baño' },
    { value: 'home office', label: 'Oficina en casa' },
    { value: 'dining room', label: 'Comedor' },
    { value: 'porch', label: 'Porche' },
    { value: 'backyard', label: 'Patio trasero' },
    { value: 'garage', label: 'Garaje' },
    { value: 'balcony', label: 'Balcón' },
    { value: 'entryway', label: 'Entrada' },
    { value: 'hallway', label: 'Pasillo' },
    { value: 'laundry room', label: 'Lavandería' },
    { value: 'walk-in closet', label: 'Vestidor' },
  ];

  return (
    <div className="continuation-mode-container">
      <div className="continuation-header">
        <h2>Modo de continuación</h2>
        <p className="section-description">
          Genera segmentos de video con consistencia de voz y comportamiento mejoradas. El primer
          segmento incluye detalles completos del personaje, mientras que los siguientes mantienen
          un tono y patrón coherentes.
        </p>
      </div>

      {!results ? (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-section">
            <h3>Información del personaje</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ageRange">Rango de edad *</label>
                <select
                  id="ageRange"
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleChange}
                  required
                >
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55+">55+</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="gender">Género *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="non-binary">No binario</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="voiceType">Tipo de voz</label>
                <select
                  id="voiceType"
                  name="voiceType"
                  value={formData.voiceType}
                  onChange={handleChange}
                >
                  <option value="warm-friendly">Cálida y amigable</option>
                  <option value="professional-clear">Profesional y clara</option>
                  <option value="energetic-upbeat">Energética y animada</option>
                  <option value="calm-soothing">Calmante y suave</option>
                  <option value="conversational-casual">Conversacional e informal</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="energyLevel">Nivel de energía (%)</label>
                <input
                  type="number"
                  id="energyLevel"
                  name="energyLevel"
                  value={formData.energyLevel}
                  onChange={handleChange}
                  min="50"
                  max="100"
                  step="5"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Detalles avanzados del personaje</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ethnicity">Etnicidad/Apariencia</label>
                <select
                  id="ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleChange}
                >
                  <option value="">No especificado</option>
                  <option value="caucasian">Caucásico</option>
                  <option value="african-american">Afroamericano</option>
                  <option value="hispanic-latino">Hispano/Latino</option>
                  <option value="asian-east">Asiático oriental</option>
                  <option value="asian-south">Asiático meridional</option>
                  <option value="middle-eastern">Medio Oriente</option>
                  <option value="mixed-race">Mestizo</option>
                  <option value="pacific-islander">Isleño del Pacífico</option>
                  <option value="native-american">Nativo americano</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="accentRegion">Acento/Región de voz</label>
                <select
                  id="accentRegion"
                  name="accentRegion"
                  value={formData.accentRegion}
                  onChange={handleChange}
                >
                  <option value="neutral-american">Neutro americano</option>
                  <option value="southern-us">Sur de EE.UU.</option>
                  <option value="new-york">Nueva York</option>
                  <option value="midwest">Medio Oeste</option>
                  <option value="california">California</option>
                  <option value="british-rp">Británico (RP)</option>
                  <option value="british-regional">Británico regional</option>
                  <option value="australian">Australiano</option>
                  <option value="canadian">Canadiense</option>
                  <option value="irish">Irlandés</option>
                  <option value="scottish">Escocés</option>
                  <option value="international">Internacional/Mixto</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="characterFeatures">Características específicas (opcional)</label>
                <input
                  type="text"
                  id="characterFeatures"
                  name="characterFeatures"
                  value={formData.characterFeatures}
                  onChange={handleChange}
                  placeholder="p.ej., cabello rizado, gafas, pecas..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="clothingDetails">Detalles de vestimenta (opcional)</label>
                <input
                  type="text"
                  id="clothingDetails"
                  name="clothingDetails"
                  value={formData.clothingDetails}
                  onChange={handleChange}
                  placeholder="p.ej., suéter crema, jeans oscuros..."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Producto y guion</h3>
            <div className="form-group">
              <label htmlFor="product">Nombre del producto *</label>
              <input
                type="text"
                id="product"
                name="product"
                value={formData.product}
                onChange={handleChange}
                placeholder="p.ej., Suero facial, Cafetera..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="script">Guion completo *</label>
              <textarea
                id="script"
                name="script"
                value={formData.script}
                onChange={handleChange}
                placeholder="Ingresa tu guion UGC completo..."
                rows={8}
                required
              />
              <p className="form-help-text">
                Cada segmento necesita entre 15 y 22 palabras (6-8 segundos). Las oraciones cortas
                se combinarán automáticamente.
              </p>
            </div>
          </div>

          <div className="form-section">
            <h3>Configuración de escenario</h3>
            <div className="form-group">
              <label>Modo de configuración</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="settingMode"
                    value="single"
                    checked={formData.settingMode === 'single'}
                    onChange={() => handleSettingModeChange('single')}
                  />
                  Ubicación única
                </label>
                <label>
                  <input
                    type="radio"
                    name="settingMode"
                    value="home-tour"
                    checked={formData.settingMode === 'home-tour'}
                    onChange={() => handleSettingModeChange('home-tour')}
                  />
                  Recorrido por la casa
                </label>
                <label>
                  <input
                    type="radio"
                    name="settingMode"
                    value="indoor-outdoor"
                    checked={formData.settingMode === 'indoor-outdoor'}
                    onChange={() => handleSettingModeChange('indoor-outdoor')}
                  />
                  Mezcla interior/exterior
                </label>
              </div>
            </div>
            {formData.settingMode === 'single' ? (
              <div className="form-group">
                <label htmlFor="room">Habitación/Ubicación *</label>
                <select
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  required
                >
                  {locationOptions.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Secuencia de ubicaciones</label>
                {formData.locations.map((loc, i) => (
                  <div key={i} className="location-item">
                    <span>Segmento {i + 1}:</span>
                    <select value={loc} onChange={(e) => handleLocationChange(i, e.target.value)}>
                      {locationOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <p className="form-help-text">
                  Las ubicaciones se asignan en orden. Los segmentos restantes usan la última
                  ubicación.
                </p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Configuraciones de producción visual</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cameraStyle">Estilo de cámara</label>
                <select
                  id="cameraStyle"
                  name="cameraStyle"
                  value={formData.cameraStyle}
                  onChange={handleChange}
                >
                  <option value="static-handheld">Estática/manual</option>
                  <option value="smooth-movement">Movimiento suave</option>
                  <option value="dynamic-cuts">Cortes dinámicos</option>
                  <option value="documentary-style">Estilo documental</option>
                  <option value="pov-selfie">POV Selfie (teléfono en mano)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="timeOfDay">Hora del día</label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={handleChange}
                >
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                  <option value="golden-hour">Hora dorada</option>
                  <option value="evening">Noche</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productStyle">Estilo de exhibición del producto</label>
                <select
                  id="productStyle"
                  name="productStyle"
                  value={formData.productStyle}
                  onChange={handleChange}
                >
                  <option value="natural">Manejo natural</option>
                  <option value="hero-shots">Tomas heroicas</option>
                  <option value="lifestyle-integrated">Integración de estilo de vida</option>
                  <option value="demonstration-focused">Enfocado en demostración</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="energyArc">Arco de energía</label>
                <select
                  id="energyArc"
                  name="energyArc"
                  value={formData.energyArc}
                  onChange={handleChange}
                >
                  <option value="consistent">Consistente</option>
                  <option value="building">Construir entusiasmo</option>
                  <option value="problem-solution">Problema → Solución</option>
                  <option value="discovery">Viaje de descubrimiento</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="narrativeStyle">Estilo narrativo</label>
                <select
                  id="narrativeStyle"
                  name="narrativeStyle"
                  value={formData.narrativeStyle}
                  onChange={handleChange}
                >
                  <option value="direct-review">Reseña directa</option>
                  <option value="storytelling">Narración</option>
                  <option value="educational">Educativo</option>
                  <option value="testimonial">Testimonio</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="backgroundLife"
                    checked={formData.backgroundLife}
                    onChange={handleChange}
                  />
                  Incluir vida de fondo
                </label>
                <p className="form-help-text">Agregar actividad sutil de fondo para realismo</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Formato de salida</h3>
            <div className="form-group">
              <label htmlFor="jsonFormat">Formato JSON</label>
              <select
                id="jsonFormat"
                name="jsonFormat"
                value={formData.jsonFormat}
                onChange={handleChange}
              >
                <option value="standard">Estándar (detalle equilibrado)</option>
                <option value="enhanced">Mejorado (detalle máximo de continuidad)</option>
              </select>
              <p className="form-help-text">
                Ambos formatos incluyen secciones mejoradas en modo de continuación
              </p>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Generando todos los segmentos...' : 'Generar segmentos de continuación'}
          </button>
        </form>
      ) : (
        <>
          <ResultsDisplay results={results} />
          {results.voiceProfile && (
            <div className="voice-profile-display">
              <h3>Perfil de voz (usado para consistencia)</h3>
              <div className="voice-details">
                <p>
                  <strong>Especificaciones técnicas:</strong>
                </p>
                <pre>{JSON.stringify(results.voiceProfile.technical, null, 2)}</pre>
                <p>
                  <strong>Voz base:</strong>
                </p>
                <p>{results.voiceProfile.baseVoice}</p>
              </div>
            </div>
          )}
          <DownloadButton segments={results.segments} metadata={results.metadata} />
          <button onClick={() => setResults(null)} className="back-button">
            Generar nuevo guion
          </button>
        </>
      )}

      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default ContinuationMode;
