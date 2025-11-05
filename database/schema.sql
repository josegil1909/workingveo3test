-- Esquema de base de datos para UGC Veo3 con n8n
-- PostgreSQL 14+

-- Tabla principal de generaciones
CREATE TABLE IF NOT EXISTS ugc_generations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    character_id VARCHAR(255) NOT NULL,
    
    -- Datos de entrada
    script TEXT NOT NULL,
    product VARCHAR(255) NOT NULL,
    
    -- Configuración
    age_range VARCHAR(50),
    gender VARCHAR(50),
    voice_type VARCHAR(100),
    energy_level VARCHAR(10),
    continuation_mode BOOLEAN DEFAULT FALSE,
    
    -- Resultados
    segments JSONB,
    voice_profile JSONB,
    metadata JSONB,
    videos JSONB,
    
    -- Estado y timestamps
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Índices para búsquedas
    CONSTRAINT unique_conversation UNIQUE (conversation_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_ugc_conversation ON ugc_generations(conversation_id);
CREATE INDEX idx_ugc_character ON ugc_generations(character_id);
CREATE INDEX idx_ugc_status ON ugc_generations(status);
CREATE INDEX idx_ugc_created ON ugc_generations(created_at DESC);

-- Tabla de conversaciones (opcional, para histórico de chat)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'user' o 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_conversation 
        FOREIGN KEY (conversation_id) 
        REFERENCES ugc_generations(conversation_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_chat_conversation ON chat_history(conversation_id, created_at);

-- Tabla de voice profiles reutilizables
CREATE TABLE IF NOT EXISTS voice_profiles (
    id SERIAL PRIMARY KEY,
    character_id VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB NOT NULL,
    generation_count INTEGER DEFAULT 1,
    last_used TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_character ON voice_profiles(character_id);

-- Vista para monitoreo rápido
CREATE OR REPLACE VIEW generation_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_generations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'videos_generated') as with_videos,
    COUNT(*) FILTER (WHERE continuation_mode = TRUE) as continuation_mode,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds
FROM ugc_generations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Función para limpiar generaciones antiguas (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_generations()
RETURNS void AS $$
BEGIN
    DELETE FROM ugc_generations 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('completed', 'videos_generated');
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE ugc_generations IS 'Almacena todas las generaciones de contenido UGC con Veo3';
COMMENT ON COLUMN ugc_generations.segments IS 'Array de segmentos JSON generados por OpenAI';
COMMENT ON COLUMN ugc_generations.voice_profile IS 'Perfil de voz extraído del primer segmento en modo continuación';
COMMENT ON COLUMN ugc_generations.videos IS 'Descripciones de video generadas por Gemini/Veo3';
COMMENT ON COLUMN ugc_generations.status IS 'Estados: pending, segments_generated, videos_generated, completed, failed';
