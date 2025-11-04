import React, { useState, useEffect, useCallback } from 'react';

function ScriptForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    script: '',
    ageRange: '25-34',
    gender: 'female',
    product: '',
    room: 'living room',
    style: 'casual and friendly',
    jsonFormat: 'standard', // 'standard' or 'enhanced'
    settingMode: 'single', // 'single', 'home-tour', 'indoor-outdoor'
    locations: [], // for mixed locations
    cameraStyle: 'static-handheld',
    timeOfDay: 'morning',
    backgroundLife: false,
    productStyle: 'natural',
    energyArc: 'consistent',
    narrativeStyle: 'direct-review',
    voiceType: 'warm-friendly',
    energyLevel: '80',
    targetWordsPerSegment: '20',
    showPreview: false,
    ethnicity: '',
    characterFeatures: '',
    accentRegion: 'neutral-american',
  });

  const [scriptPreview, setScriptPreview] = useState([]);
  const [savedSettings, setSavedSettings] = useState([]);

  // Load saved settings on component mount
  useEffect(() => {
    const saved = localStorage.getItem('ugcScriptSettings');
    if (saved) {
      try {
        setSavedSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved settings:', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (name === 'settingMode') {
      // Reset locations when changing setting mode
      let defaultLocations = [];
      if (value === 'home-tour') {
        defaultLocations = ['living room', 'kitchen', 'bedroom', 'home office'];
      } else if (value === 'indoor-outdoor') {
        defaultLocations = ['living room', 'porch', 'kitchen', 'backyard'];
      }

      setFormData({
        ...formData,
        [name]: value,
        locations: defaultLocations,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLocationChange = (index, value) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({
      ...formData,
      locations: newLocations,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Script preview logic
  const previewScript = useCallback(() => {
    if (!formData.script || formData.script.trim().length < 50) {
      setScriptPreview([]);
      return;
    }

    const targetWords = parseInt(formData.targetWordsPerSegment) || 20;
    const minWords = Math.max(15, targetWords - 5);
    const maxWords = targetWords + 2;

    // Split into sentences
    const sentences = formData.script.match(/[^.!?]+[.!?]+/g) || [formData.script];

    const segments = [];
    let currentSegment = '';
    let currentWordCount = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const sentenceWords = sentence.split(/\s+/).length;

      if (currentSegment === '') {
        currentSegment = sentence;
        currentWordCount = sentenceWords;

        // Keep adding sentences until we meet minimum
        while (currentWordCount < minWords && i + 1 < sentences.length) {
          i++;
          const nextSentence = sentences[i].trim();
          const nextWords = nextSentence.split(/\s+/).length;

          if (currentWordCount + nextWords > maxWords) {
            if (currentWordCount < minWords) {
              currentSegment += ' ' + nextSentence;
              currentWordCount += nextWords;
            } else {
              i--;
              break;
            }
          } else {
            currentSegment += ' ' + nextSentence;
            currentWordCount += nextWords;
          }
        }

        segments.push({
          text: currentSegment,
          wordCount: currentWordCount,
          duration: Math.round((currentWordCount / 2.5) * 10) / 10, // Approximate seconds
        });
        currentSegment = '';
        currentWordCount = 0;
      }
    }

    setScriptPreview(segments);
  }, [formData.script, formData.targetWordsPerSegment]);

  // Update preview when script or target words change
  useEffect(() => {
    if (formData.showPreview) {
      previewScript();
    }
  }, [formData.showPreview, previewScript]);

  // Save/Load Settings Functions
  const saveSettings = () => {
    const settingsToSave = { ...formData };
    // Remove script and preview state from saved settings
    delete settingsToSave.script;
    delete settingsToSave.showPreview;

    const settingName = prompt('Ingresa un nombre para estas configuraciones:');
    if (settingName) {
      const existingSaved = [...savedSettings];
      const newSetting = {
        name: settingName,
        date: new Date().toLocaleDateString(),
        settings: settingsToSave,
      };

      // Check if name already exists
      const existingIndex = existingSaved.findIndex((s) => s.name === settingName);
      if (existingIndex >= 0) {
        if (window.confirm(`La configuración "${settingName}" ya existe. ¿Sobrescribir?`)) {
          existingSaved[existingIndex] = newSetting;
        } else {
          return;
        }
      } else {
        existingSaved.push(newSetting);
      }

      localStorage.setItem('ugcScriptSettings', JSON.stringify(existingSaved));
      setSavedSettings(existingSaved);
      alert(`¡Configuración "${settingName}" guardada exitosamente!`);
    }
  };

  const loadSettings = (settingName) => {
    const setting = savedSettings.find((s) => s.name === settingName);
    if (setting) {
      setFormData({
        ...formData,
        ...setting.settings,
        script: formData.script, // Keep current script
        showPreview: false,
      });
      alert(`¡Configuración "${settingName}" cargada!`);
    }
  };

  const deleteSettings = (settingName) => {
    if (window.confirm(`¿Eliminar configuración "${settingName}"?`)) {
      const updated = savedSettings.filter((s) => s.name !== settingName);
      localStorage.setItem('ugcScriptSettings', JSON.stringify(updated));
      setSavedSettings(updated);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="settings-controls">
        <h3>Gestión de Configuraciones</h3>
        <div className="settings-buttons">
          <button type="button" className="settings-button save-button" onClick={saveSettings}>
            💾 Guardar configuración actual
          </button>

          {savedSettings.length > 0 && (
            <div className="saved-settings-list">
              <label>Cargar configuración guardada:</label>
              <select
                onChange={(e) => e.target.value && loadSettings(e.target.value)}
                defaultValue=""
              >
                <option value="">Seleccione configuración a cargar...</option>
                {savedSettings.map((setting) => (
                  <option key={setting.name} value={setting.name}>
                    {setting.name} ({setting.date})
                  </option>
                ))}
              </select>
              {savedSettings.map((setting) => (
                <button
                  key={`delete-${setting.name}`}
                  type="button"
                  className="delete-settings-btn"
                  onClick={() => deleteSettings(setting.name)}
                  title={`Eliminar ${setting.name}`}
                >
                  🗑️
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="script">Guion *</label>
        <textarea
          id="script"
          name="script"
          value={formData.script}
          onChange={handleChange}
          placeholder="Pega tu guion UGC aquí (mínimo 50 caracteres)..."
          required
          minLength={50}
        />
        <p className="form-help-text">
          Cada segmento necesita entre 15 y 22 palabras (6-8 segundos de narración). Las oraciones
          cortas se combinarán automáticamente.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="targetWordsPerSegment">
          Palabras por Segmento (Objetivo: {formData.targetWordsPerSegment})
        </label>
        <input
          type="range"
          id="targetWordsPerSegment"
          name="targetWordsPerSegment"
          value={formData.targetWordsPerSegment}
          onChange={handleChange}
          min="15"
          max="30"
          step="1"
        />
        <p className="form-help-text">
          Ajusta el número de palabras objetivo por segmento de 8 segundos (15 = ritmo más lento, 30
          = más rápido)
        </p>
      </div>

      {formData.script && formData.script.trim().length >= 50 && (
        <div className="form-group">
          <button
            type="button"
            className="preview-button"
            onClick={() => setFormData({ ...formData, showPreview: !formData.showPreview })}
          >
            {formData.showPreview ? 'Ocultar' : 'Mostrar'} vista previa del guion
          </button>
        </div>
      )}

      {formData.showPreview && scriptPreview.length > 0 && (
        <div className="script-preview">
          <h3>Vista previa del guion - {scriptPreview.length} segmentos</h3>
          <p className="preview-info">
            Total duration: ~{scriptPreview.reduce((sum, seg) => sum + seg.duration, 0).toFixed(1)}{' '}
            seconds
          </p>
          <div className="preview-segments">
            {scriptPreview.map((segment, index) => (
              <div key={index} className="preview-segment">
                <div className="preview-segment-header">
                  <span className="segment-number">Segmento {index + 1}</span>
                  <span className="segment-stats">
                    {segment.wordCount} palabras | ~{segment.duration}s
                  </span>
                </div>
                <div className="preview-segment-text">{segment.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <label htmlFor="ageRange">Rango de edad</label>
        <select id="ageRange" name="ageRange" value={formData.ageRange} onChange={handleChange}>
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55+">55+</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="gender">Género</label>
        <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
          <option value="female">Femenino</option>
          <option value="male">Masculino</option>
          <option value="non-binary">No binario</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="voiceType">Tipo de voz</label>
        <select id="voiceType" name="voiceType" value={formData.voiceType} onChange={handleChange}>
          <option value="warm-friendly">Cálida y amigable</option>
          <option value="professional-clear">Profesional y clara</option>
          <option value="energetic-upbeat">Energética y animada</option>
          <option value="calm-soothing">Calmante y suave</option>
          <option value="conversational-casual">Conversacional e informal</option>
          <option value="authoritative-confident">Autoritaria y confiada</option>
          <option value="youthful-playful">Juvenil y juguetona</option>
        </select>
        <p className="form-help-text">
          Define el tono de voz y estilo de entrega para consistencia entre segmentos
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="energyLevel">Nivel de energía ({formData.energyLevel}%)</label>
        <input
          type="range"
          id="energyLevel"
          name="energyLevel"
          value={formData.energyLevel}
          onChange={handleChange}
          min="50"
          max="100"
          step="5"
        />
        <p className="form-help-text">
          Nivel de energía base para narración (50% = tranquilo, 100% = muy entusiasta)
        </p>
      </div>

      <div className="form-section">
        <h3>Detalles avanzados de personaje</h3>

        <div className="form-group">
          <label htmlFor="ethnicity">Etnicidad/Apariencia</label>
          <select
            id="ethnicity"
            name="ethnicity"
            value={formData.ethnicity || ''}
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
          <label htmlFor="characterFeatures">Rasgos específicos (opcional)</label>
          <input
            type="text"
            id="characterFeatures"
            name="characterFeatures"
            value={formData.characterFeatures || ''}
            onChange={handleChange}
            placeholder="ej.: cabello rizado, gafas, pecas, barba..."
          />
          <p className="form-help-text">
            Añade rasgos físicos específicos para que el personaje sea más distintivo
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="accentRegion">Acento/Región de voz</label>
          <select
            id="accentRegion"
            name="accentRegion"
            value={formData.accentRegion || 'neutral-american'}
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

      <div className="form-group">
        <label htmlFor="settingMode">Modo de configuración</label>
        <select
          id="settingMode"
          name="settingMode"
          value={formData.settingMode}
          onChange={handleChange}
        >
          <option value="single">Una sola ubicación</option>
          <option value="home-tour">Ubicaciones mixtas - Recorrido por el hogar</option>
          <option value="indoor-outdoor">Ubicaciones mixtas - Interior/Exterior</option>
        </select>
        <p className="form-help-text">
          {formData.settingMode === 'single'
            ? 'Graba en una ubicación consistente'
            : formData.settingMode === 'home-tour'
              ? 'Muévete por diferentes habitaciones de la casa'
              : 'Mezcla ubicaciones interiores y exteriores'}
        </p>
      </div>

      {formData.settingMode === 'single' ? (
        <div className="form-group">
          <label htmlFor="room">Habitación/Ubicación</label>
          <select id="room" name="room" value={formData.room} onChange={handleChange}>
            <option value="living room">Sala de estar</option>
            <option value="kitchen">Cocina</option>
            <option value="bathroom">Baño</option>
            <option value="bedroom">Dormitorio</option>
            <option value="home office">Oficina en casa</option>
            <option value="porch">Porche</option>
            <option value="backyard">Patio trasero</option>
          </select>
        </div>
      ) : (
        <div className="form-group">
          <label>Secuencia de ubicaciones</label>
          {formData.locations.map((location, index) => (
            <div key={index} className="location-item">
              <span>Segmento {index + 1}:</span>
              <select
                value={location}
                onChange={(e) => handleLocationChange(index, e.target.value)}
              >
                <option value="living room">Sala de estar</option>
                <option value="kitchen">Cocina</option>
                <option value="bathroom">Baño</option>
                <option value="bedroom">Dormitorio</option>
                <option value="home office">Oficina en casa</option>
                <option value="porch">Porche</option>
                <option value="backyard">Patio trasero</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="style">Estilo</label>
        <select id="style" name="style" value={formData.style} onChange={handleChange}>
          <option value="casual and friendly">Casual y amigable</option>
          <option value="professional">Profesional</option>
          <option value="energetic">Energético</option>
          <option value="calm and soothing">Calmado y suave</option>
          <option value="luxury">Lujoso</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="jsonFormat">Formato JSON</label>
        <select
          id="jsonFormat"
          name="jsonFormat"
          value={formData.jsonFormat}
          onChange={handleChange}
        >
          <option value="standard">Estándar (300+ palabras)</option>
          <option value="enhanced">Continuidad mejorada (500+ palabras)</option>
        </select>
        <p className="form-help-text">
          {formData.jsonFormat === 'enhanced'
            ? 'El formato mejorado incluye marcadores de continuidad detallados y microexpresiones para transiciones fluidas'
            : 'El formato estándar proporciona descripciones completas de personaje y escena'}
        </p>
      </div>

      <div className="form-section">
        <h3>Configuraciones visuales y de producción</h3>

        <div className="form-group">
          <label htmlFor="cameraStyle">Estilo de cámara</label>
          <select
            id="cameraStyle"
            name="cameraStyle"
            value={formData.cameraStyle}
            onChange={handleChange}
          >
            <option value="static-handheld">Estático - Mano</option>
            <option value="slow-push">Paneo lento</option>
            <option value="orbit">Movimiento orbital sutil</option>
            <option value="dynamic">Mano dinámica</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timeOfDay">Hora del día / Iluminación</label>
          <select
            id="timeOfDay"
            name="timeOfDay"
            value={formData.timeOfDay}
            onChange={handleChange}
          >
            <option value="morning">Luz matinal (suave, dorada)</option>
            <option value="afternoon">Tarde brillante (clara, blanca)</option>
            <option value="golden-hour">Hora dorada (cálida, atardecer)</option>
            <option value="evening">Tarde acogedora (iluminación interior)</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="backgroundLife"
              checked={formData.backgroundLife}
              onChange={handleChange}
            />
            Agregar ambiente de fondo (mascotas, familiares, sonidos naturales)
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Historia y presentación</h3>

        <div className="form-group">
          <label htmlFor="productStyle">Estilo de exhibición del producto</label>
          <select
            id="productStyle"
            name="productStyle"
            value={formData.productStyle}
            onChange={handleChange}
          >
            <option value="natural">Integración natural</option>
            <option value="showcase">Mostrar características</option>
            <option value="before-after">Demostración antes/después</option>
            <option value="lifestyle">Contexto de estilo de vida</option>
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
            <option value="consistent">Energía consistente</option>
            <option value="building">Generar entusiasmo</option>
            <option value="problem-solution">De problema a solución</option>
            <option value="discovery">Viaje de descubrimiento</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="narrativeStyle">Estilo narrativo</label>
          <select
            id="narrativeStyle"
            name="narrativeStyle"
            value={formData.narrativeStyle}
            onChange={handleChange}
          >
            <option value="direct-review">Reseña directa</option>
            <option value="day-in-life">Un día en la vida</option>
            <option value="problem-solver">Solucionador de problemas</option>
            <option value="comparison">Historia comparativa</option>
          </select>
        </div>
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Generando...' : 'Generar segmentos'}
      </button>
    </form>
  );
}

export default ScriptForm;
