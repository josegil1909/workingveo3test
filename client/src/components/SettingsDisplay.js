import React from 'react';

function SettingsDisplay({ settings }) {
  if (!settings) return null;

  const formatSettingValue = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (key === 'energyLevel') return `${value}%`;
    if (key === 'targetWordsPerSegment') return `${value} palabras`;
    if (key === 'locations' && Array.isArray(value)) return value.join(' → ');
    if (key === 'script') return `${value.substring(0, 50)}...`;
    return value || 'No especificado';
  };

  const settingLabels = {
  ageRange: 'Rango de Edad',
  gender: 'Género',
  product: 'Producto',
  room: 'Habitación/Escenario',
  style: 'Estilo',
  jsonFormat: 'Formato JSON',
  settingMode: 'Modo de Configuración',
  locations: 'Secuencia de Ubicaciones',
  cameraStyle: 'Estilo de Cámara',
  timeOfDay: 'Hora del Día',
  backgroundLife: 'Vida de Fondo',
  productStyle: 'Visualización del Producto',
  energyArc: 'Arco de Energía',
  narrativeStyle: 'Estilo Narrativo',
  voiceType: 'Tipo de Voz',
  energyLevel: 'Nivel de Energía',
  targetWordsPerSegment: 'Palabras por Segmento',
  ethnicity: 'Etnicidad',
  characterFeatures: 'Características del Personaje',
  accentRegion: 'Acento/Región',
};

  // Group settings by category
  const characterSettings = ['ageRange', 'gender', 'ethnicity', 'characterFeatures', 'voiceType', 'energyLevel', 'accentRegion'];
  const productSettings = ['product', 'productStyle'];
  const sceneSettings = ['settingMode', 'room', 'locations', 'timeOfDay', 'backgroundLife'];
  const visualSettings = ['cameraStyle', 'style', 'energyArc', 'narrativeStyle'];
  const technicalSettings = ['jsonFormat', 'targetWordsPerSegment'];

  const renderSettingGroup = (title, keys) => {
    const relevantSettings = keys.filter(key => 
      settings[key] !== undefined && 
      settings[key] !== '' && 
      settings[key] !== null &&
      key !== 'showPreview'
    );

    if (relevantSettings.length === 0) return null;

    return (
      <div className="settings-group">
        <h4>{title}</h4>
        <div className="settings-grid">
          {relevantSettings.map(key => (
            <div key={key} className="setting-item">
              <span className="setting-label">{settingLabels[key] || key}:</span>
              <span className="setting-value">{formatSettingValue(key, settings[key])}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="settings-display">
      <h3>Configuración de Generación</h3>
      <div className="settings-content">
        {renderSettingGroup('Personaje', characterSettings)}
        {renderSettingGroup('Producto', productSettings)}
        {renderSettingGroup('Escena', sceneSettings)}
        {renderSettingGroup('Estilo Visual', visualSettings)}
        {renderSettingGroup('Técnico', technicalSettings)}
      </div>
    </div>
  );
}

export default SettingsDisplay;
