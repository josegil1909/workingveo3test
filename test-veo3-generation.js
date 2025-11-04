/**
 * Script de prueba para Veo 3.1
 *
 * Este script verifica que:
 * 1. El SDK de Google está instalado correctamente
 * 2. La API key está configurada
 * 3. Podemos generar un video simple
 *
 * Uso:
 *   node test-veo3-generation.js
 */

import dotenv from 'dotenv';
import genai from '@google/genai';

dotenv.config();

async function testVeo3Integration() {
  console.log('🎬 Probando integración de Veo 3.1...\n');

  // 1. Verificar API key
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ Error: GOOGLE_GEMINI_API_KEY no está configurada');
    console.error('   Obtén tu API key en: https://aistudio.google.com/apikey');
    process.exit(1);
  }
  console.log('✅ API key encontrada');

  // 2. Inicializar cliente
  let client;
  try {
    client = new genai.Client({ apiKey: apiKey });
    console.log('✅ Cliente de Veo 3.1 inicializado');
  } catch (error) {
    console.error('❌ Error al inicializar cliente:', error.message);
    process.exit(1);
  }

  // 3. Generar un video de prueba simple
  console.log('\n📹 Generando video de prueba...');
  console.log('   Modelo: veo-3.1-generate-preview');
  console.log('   Duración: 4 segundos (prueba rápida)');
  console.log('   Resolución: 720p\n');

  const prompt = 'A calico kitten sleeping peacefully in the sunshine';
  console.log(`   Prompt: "${prompt}"\n`);

  try {
    // Iniciar generación
    const operation = await client.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      config: {
        aspectRatio: '16:9',
        durationSeconds: 4,
        resolution: '720p',
        personGeneration: 'dont_allow', // Sin personas para test rápido
      },
    });

    console.log('✅ Operación iniciada:', operation.name);
    console.log('\n⏳ Esperando generación (puede tomar 1-6 minutos)...');

    // Poll para completar
    let currentOperation = operation;
    let pollCount = 0;
    const maxPolls = 60;

    while (!currentOperation.done && pollCount < maxPolls) {
      await sleep(10000); // 10 segundos
      pollCount++;

      try {
        currentOperation = await client.operations.get(currentOperation);
        const elapsed = pollCount * 10;
        process.stdout.write(`\r   Poll ${pollCount}/${maxPolls} - ${elapsed}s transcurridos...`);
      } catch (error) {
        console.error('\n❌ Error al consultar estado:', error.message);
        break;
      }
    }

    console.log('\n');

    if (!currentOperation.done) {
      console.error('⏱️ Timeout: La generación tomó más de 10 minutos');
      console.log('   Esto puede ocurrir durante picos de tráfico');
      console.log('   La operación puede completarse eventualmente');
      console.log(`   Operation ID: ${operation.name}`);
      process.exit(1);
    }

    // Descargar video
    const generatedVideo = currentOperation.response.generated_videos[0];
    const timestamp = Date.now();
    const filename = `test_veo3_${timestamp}.mp4`;

    await client.files.download({ file: generatedVideo.video });
    generatedVideo.video.save(filename);

    console.log('✅ Video generado exitosamente!');
    console.log(`   Archivo: ${filename}`);
    console.log(`   Tiempo total: ${pollCount * 10} segundos`);
    console.log('\n🎉 Integración de Veo 3.1 funcionando correctamente!\n');
  } catch (error) {
    console.error('\n❌ Error durante la generación:', error.message);

    if (error.message.includes('API key')) {
      console.error('   Verifica que tu API key sea válida');
    } else if (error.message.includes('quota')) {
      console.error('   Has alcanzado el límite de tu cuota');
      console.error('   Espera un momento o verifica tu cuenta en Google AI Studio');
    } else if (error.message.includes('safety')) {
      console.error('   El prompt fue bloqueado por filtros de seguridad');
    }

    console.error('\n   Stack trace:', error.stack);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ejecutar test
testVeo3Integration().catch((error) => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
