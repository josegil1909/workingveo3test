import React, { useState, useEffect } from 'react';

function ScriptFormPlus({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    script: '',
    ageRange: '25-34',
    gender: 'female',
    product: '',
    room: 'living room',
    style: 'casual and friendly',
    jsonFormat: 'standard',
    settingMode: 'ai-inspired', // default to AI Inspired in Plus
    locations: [],
    cameraStyle: 'ai-inspired',
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
    clothingDetails: '',
    accentRegion: 'neutral-american'
  });

  const [scriptPreview, setScriptPreview] = useState([]);
  const [savedSettings, setSavedSettings] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('ugcScriptSettingsPlus');
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
        [name]: checked
      });
    } else if (name === 'settingMode') {
      let defaultLocations = [];
      if (value === 'home-tour') {
        defaultLocations = ['living room', 'kitchen', 'bedroom', 'home office'];
      } else if (value === 'indoor-outdoor') {
        defaultLocations = ['living room', 'porch', 'kitchen', 'backyard'];
      } else if (value === 'ai-inspired') {
        defaultLocations = [];
      }

      setFormData({
        ...formData,
        [name]: value,
        locations: defaultLocations
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLocationChange = (index, value) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({
      ...formData,
      locations: newLocations
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const previewScript = () => {
    if (!formData.script || formData.script.trim().length < 50) {
      setScriptPreview([]);
      return;
    }

    const targetWords = parseInt(formData.targetWordsPerSegment) || 20;
    const minWords = Math.max(15, targetWords - 5);
    const maxWords = targetWords + 2;

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
          duration: Math.round((currentWordCount / 2.5) * 10) / 10
        });
        currentSegment = '';
        currentWordCount = 0;
      }
    }

    setScriptPreview(segments);
  };

  useEffect(() => {
    if (formData.showPreview) {
      previewScript();
    }
  }, [formData.script, formData.targetWordsPerSegment, formData.showPreview]);

  const saveSettings = () => {
    const settingsToSave = { ...formData };
    delete settingsToSave.script;
    delete settingsToSave.showPreview;

  const settingName = prompt('Ingresa un nombre para estas configuraciones (Estándar Plus):');
    if (settingName) {
      const existingSaved = [...savedSettings];
      const newSetting = {
        name: settingName,
        date: new Date().toLocaleDateString(),
        settings: settingsToSave
      };

      const existingIndex = existingSaved.findIndex(s => s.name === settingName);
      if (existingIndex >= 0) {
        if (window.confirm(`La configuración "${settingName}" ya existe. ¿Sobrescribir?`)) {
          existingSaved[existingIndex] = newSetting;
        } else {
          return;
        }
      } else {
        existingSaved.push(newSetting);
      }

      localStorage.setItem('ugcScriptSettingsPlus', JSON.stringify(existingSaved));
      setSavedSettings(existingSaved);
  alert(`¡Configuración "${settingName}" guardada exitosamente!`);
    }
  };

  const loadSettings = (settingName) => {
    const setting = savedSettings.find(s => s.name === settingName);
    if (setting) {
      setFormData({
        ...formData,
        ...setting.settings,
        script: formData.script,
        showPreview: false
      });
  alert(`¡Configuración "${settingName}" cargada!`);
    }
  };

  const deleteSettings = (settingName) => {
  if (window.confirm(`¿Eliminar configuración "${settingName}"?`)) {
      const updated = savedSettings.filter(s => s.name !== settingName);
      localStorage.setItem('ugcScriptSettingsPlus', JSON.stringify(updated));
      setSavedSettings(updated);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="settings-controls">
        <h3>Gestión de configuraciones (Estándar Plus)</h3>
        <div className="settings-buttons">
          <button
            type="button"
            className="settings-button save-button"
            onClick={saveSettings}
          >
            💾 Guardar configuraciones actuales
          </button>

          {savedSettings.length > 0 && (
            <div className="saved-settings-list">
              <label>Cargar configuraciones guardadas:</label>
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

      <div className="form-note">
        <p><strong>Ubicaciones y cámara inspiradas en IA:</strong> Selecciona "AI Inspired" para que el sistema infiera ubicaciones realistas y dirección de cámara creativa por segmento según tu guion. Nota: No se generan subtítulos, efectos de sonido o indicaciones musicales.</p>
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
          Cada segmento necesita entre 15 y 22 palabras (6-8 segundos de narración). Las oraciones cortas se combinarán automáticamente.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="targetWordsPerSegment">Palabras por segmento (Objetivo: {formData.targetWordsPerSegment})</label>
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
          Ajusta el número de palabras objetivo por segmento de 8 segundos (15 = ritmo más lento, 30 = más rápido)
        </p>
      </div>

      {formData.script && formData.script.trim().length >= 50 && (
        <div className="form-group">
          <button
            type="button"
            className="preview-button"
            onClick={() => setFormData({ ...formData, showPreview: !formData.showPreview })}
          >
            {formData.showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
          </button>
        </div>
      )}

      {formData.showPreview && scriptPreview.length > 0 && (
        <div className="script-preview">
          <h3>Vista previa del guion - {scriptPreview.length} segmentos</h3>
          <p className="preview-info">
            Duración total: ~{scriptPreview.reduce((sum, seg) => sum + seg.duration, 0).toFixed(1)} segundos
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
                <div className="preview-segment-text">
                  {segment.text}
                </div>
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
        <p className="form-help-text">Establece el tono vocal y el estilo de entrega para mantener la coherencia en todos los segmentos</p>
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
        <p className="form-help-text">Nivel de energía base para la entrega (50% = calmado, 100% = muy entusiasta)</p>
      </div>

      <div className="form-section">
        <h3>Detalles avanzados del personaje</h3>
        <div className="form-group">
          <label htmlFor="ethnicity">Etnicidad/Apariencia</label>
          <select id="ethnicity" name="ethnicity" value={formData.ethnicity || ''} onChange={handleChange}>
            <option value="">No especificado</option>
            <option value="caucasian">Caucásico</option>
            <option value="african-american">Afroamericano</option>
            <option value="hispanic-latino">Hispano/Latino</option>
            <option value="asian-east">Asiático del Este</option>
            <option value="asian-south">Asiático del Sur</option>
            <option value="middle-eastern">Medio Oriente</option>
            <option value="mixed-race">Raza mixta</option>
            <option value="pacific-islander">Isleño del Pacífico</option>
            <option value="native-american">Nativo americano</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="characterFeatures">Características específicas (Opcional)</label>
          <input
            type="text"
            id="characterFeatures"
            name="characterFeatures"
            value={formData.characterFeatures || ''}
            onChange={handleChange}
            placeholder="p.ej., cabello rizado, gafas, pecas, barba..."
          />
          <p className="form-help-text">Agrega características físicas específicas para hacer el personaje más distintivo</p>
        </div>
        <div className="form-group">
          <label htmlFor="clothingDetails">Detalles de la ropa (Opcional)</label>
          <input
            type="text"
            id="clothingDetails"
            name="clothingDetails"
            value={formData.clothingDetails || ''}
            onChange={handleChange}
            placeholder="p.ej., suéter de punto crema, jeans azul oscuro, collar de plata..."
          />
          <p className="form-help-text">Especifica prendas, colores, telas y accesorios exactos para incorporar</p>
        </div>
        <div className="form-group">
          <label htmlFor="accentRegion">Acento/Voz regional</label>
          <select id="accentRegion" name="accentRegion" value={formData.accentRegion || 'neutral-american'} onChange={handleChange}>
            <option value="neutral-american">Americano neutral</option>
            <option value="southern-us">Sur de EE. UU.</option>
            <option value="new-york">Nueva York</option>
            <option value="midwest">Medio oeste</option>
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
        <select id="settingMode" name="settingMode" value={formData.settingMode} onChange={handleChange}>
          <option value="ai-inspired">Inspirado en IA (ubicaciones auto-seleccionadas)</option>
          <option value="single">Una sola ubicación</option>
          <option value="home-tour">Ubicaciones mixtas - Recorrido por el hogar</option>
          <option value="indoor-outdoor">Ubicaciones mixtas - Interior/Exterior</option>
        </select>
        <p className="form-help-text">
          {formData.settingMode === 'ai-inspired' ? 'La IA infiere ubicaciones de tu guion' : formData.settingMode === 'single' ? 'Graba en una ubicación consistente' : formData.settingMode === 'home-tour' ? 'Muévete por diferentes habitaciones de la casa' : 'Mezcla ubicaciones interiores y exteriores'}
        </p>
      </div>

      {formData.settingMode === 'single' ? (
        <div className="form-group">
          <label htmlFor="room">Habitación/Ubicación</label>
          <input
            type="text"
            id="room"
            name="room"
            value={formData.room}
            onChange={handleChange}
            placeholder="p.ej., Sala de estar, Cocina..."
          />
        </div>
      ) : ( formData.settingMode === 'home-tour' ? (
        <div className="form-group">
          {formData.locations.map((loc, idx) => (
            <input
              key={idx}
              type="text"
              value={loc}
              onChange={(e) => handleLocationChange(idx, e.target.value)}
              placeholder={`Ubicación ${idx + 1}`}
            />
          ))}
        </div>
      ) : formData.settingMode === 'indoor-outdoor' ? (
        <div className="form-group">
          {formData.locations.map((loc, idx) => (
            <input
              key={idx}
              type="text"
              value={loc}
              onChange={(e) => handleLocationChange(idx, e.target.value)}
              placeholder={`Ubicación ${idx + 1}`}
            />
          ))}
        </div>
      ) : null )
      }
    </form>
  );
}

export default ScriptFormPlus;