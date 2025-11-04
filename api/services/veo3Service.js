import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import genai from '@google/genai';

class Veo3Service {
  constructor() {
    this.genAI = null;
    this.vertexAI = null;
    this.useVertexAI = false;
    this.initializeClient();
  }

  initializeClient() {
    // Check for Vertex AI configuration first
    if (
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      (process.env.VERTEX_PROJECT_ID && process.env.VERTEX_LOCATION)
    ) {
      try {
        const projectId = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
        const location = process.env.VERTEX_LOCATION || 'us-central1';

        this.vertexAI = new VertexAI({
          project: projectId,
          location: location,
        });

        this.useVertexAI = true;
        console.log('[Veo3] Vertex AI client initialized');
        console.log(`[Veo3] Project: ${projectId}, Location: ${location}`);
      } catch (error) {
        console.error('[Veo3] Failed to initialize Vertex AI:', error);
      }
    }

    // Fall back to Gemini API if no Vertex AI
    if (!this.useVertexAI) {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (apiKey && apiKey.trim() !== '') {
        this.genAI = new GoogleGenerativeAI(apiKey);
        console.log('[Veo3] Gemini API client initialized');
      } else {
        console.warn('[Veo3] No API credentials found');
      }
    }
  }

  async generateVideoFromSegment(segment, options = {}) {
    // Try to initialize again if not already done
    if (!this.genAI && !this.vertexAI) {
      this.initializeClient();
    }

    if (!this.genAI && !this.vertexAI) {
      throw new Error(
        'Veo 3 service not initialized. Please configure either Vertex AI or Gemini API credentials'
      );
    }

    console.log('[Veo3] Generating video for segment', segment.segment_info?.segment_number);

    try {
      // Create a detailed prompt from the segment data
      const prompt = this.createVideoPrompt(segment, options);

      // Use appropriate model based on authentication method
      let model;
      if (this.useVertexAI) {
        model = this.vertexAI.getGenerativeModel({
          model: 'gemini-1.5-flash-002',
        });
      } else {
        model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
        });
      }

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Generate a detailed video shot list for this UGC segment:\n\n${prompt}\n\nProvide frame-by-frame descriptions for an 8-second video.`,
              },
            ],
          },
        ],
      });

      const response = await result.response;
      const videoDescription = response.text();

      return {
        success: true,
        segmentNumber: segment.segment_info?.segment_number,
        videoDescription,
        prompt,
        duration: '8 seconds',
        status: 'description_generated',
        message: 'Video description generated. Full Veo 3 integration coming soon!',
      };
    } catch (error) {
      console.error('[Veo3] Error generating video:', error);
      throw error;
    }
  }

  createVideoPrompt(segment) {
    const isEnhanced = Boolean(segment.segment_info?.continuity_markers);

    let prompt = '';

    if (isEnhanced) {
      // Enhanced format with continuity markers
      prompt = `
UGC Video Segment ${segment.segment_info.segment_number} of ${segment.segment_info.total_segments}
Duration: ${segment.segment_info.duration}

CONTINUITY REQUIREMENTS:
- Start: ${segment.segment_info.continuity_markers.start_position}
- End: ${segment.segment_info.continuity_markers.end_position}
- Start Expression: ${segment.segment_info.continuity_markers.start_expression}
- End Expression: ${segment.segment_info.continuity_markers.end_expression}

CHARACTER:
${segment.character_description.current_state}

DIALOGUE: "${segment.action_timeline.dialogue}"

SYNCHRONIZED ACTIONS:
${Object.entries(segment.action_timeline.synchronized_actions || {})
  .map(([time, action]) => `${time}: ${action}`)
  .join('\n')}

SCENE:
- Camera: ${segment.scene_continuity.camera_position}
- Environment: ${segment.scene_continuity.props_in_frame}

MICRO-EXPRESSIONS:
${segment.action_timeline.micro_expressions || 'Natural facial movements'}

Style: Authentic UGC content, handheld camera feel, natural lighting`;
    } else {
      // Standard format
      prompt = `
UGC Video Segment ${segment.segment_info?.segment_number || 1}

CHARACTER STATE:
${segment.character_description?.current_state || 'Natural, relaxed presenter'}

DIALOGUE: "${segment.action_timeline?.dialogue || ''}"

ACTIONS:
${segment.action_timeline?.synchronized_actions || 'Natural gestures while speaking'}

CAMERA:
${segment.scene_continuity?.camera_position || 'Medium shot, eye level'}

Style: Authentic UGC content, casual and relatable`;
    }

    return prompt.trim();
  }

  async generateVideosForAllSegments(segments, options = {}) {
    console.log(`[Veo3] Generating videos for ${segments.length} segments`);

    const videoPromises = segments.map((segment, index) =>
      this.generateVideoFromSegment(segment, {
        ...options,
        segmentIndex: index,
      })
    );

    try {
      const results = await Promise.all(videoPromises);
      return {
        success: true,
        videos: results,
        totalSegments: segments.length,
      };
    } catch (error) {
      console.error('[Veo3] Error generating videos:', error);
      throw error;
    }
  }

  /**
   * Generate actual video using Veo 3.1 API
   * @param {string} prompt - Text prompt for video generation
   * @param {Object} options - Video generation options
   * @param {string} options.aspectRatio - "16:9" or "9:16" (default: "16:9")
   * @param {number} options.durationSeconds - 4, 6, or 8 seconds (default: 8)
   * @param {string} options.resolution - "720p" or "1080p" (default: "720p")
   * @param {string} options.negativePrompt - Things to avoid in video
   * @param {string} options.personGeneration - "allow_adult" or "dont_allow" (default: "allow_adult")
   * @param {Object} options.image - Optional starting frame image
   * @param {Object} options.lastFrame - Optional ending frame for interpolation
   * @param {Array} options.referenceImages - Up to 3 reference images (Veo 3.1 only)
   * @param {Object} options.video - Video to extend
   * @returns {Promise<Object>} Generated video operation
   */
  async generateActualVideo(prompt, options = {}) {
    if (!this.genAI && !this.vertexAI) {
      this.initializeClient();
    }

    if (!this.genAI && !this.vertexAI) {
      throw new Error(
        'Veo 3 service not initialized. Please configure either Vertex AI or Gemini API credentials'
      );
    }

    console.log('[Veo3] Starting actual video generation with Veo 3.1');
    console.log('[Veo3] Prompt:', prompt);

    try {
      // Prepare configuration
      const config = {
        aspectRatio: options.aspectRatio || '16:9',
        durationSeconds: options.durationSeconds || 8,
        resolution: options.resolution || '720p',
        personGeneration: options.personGeneration || 'allow_adult',
      };

      if (options.negativePrompt) {
        config.negativePrompt = options.negativePrompt;
      }

      if (options.referenceImages && options.referenceImages.length > 0) {
        config.referenceImages = options.referenceImages;
      }

      console.log('[Veo3] Configuration:', JSON.stringify(config, null, 2));

      // Use Gemini API for Veo 3.1
      if (this.genAI) {
        const client = new genai.Client({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

        // Start video generation operation
        const operation = await client.models.generateVideos({
          model: 'veo-3.1-generate-preview',
          prompt: prompt,
          image: options.image,
          lastFrame: options.lastFrame,
          video: options.video,
          config: config,
        });

        console.log('[Veo3] Video generation started, operation:', operation.name);

        // Poll for completion
        let currentOperation = operation;
        let pollCount = 0;
        const maxPolls = 60; // 10 minutes max (10 sec intervals)

        while (!currentOperation.done && pollCount < maxPolls) {
          console.log(`[Veo3] Polling operation status... (${pollCount + 1}/${maxPolls})`);
          await this.sleep(10000); // Wait 10 seconds
          currentOperation = await client.operations.get(currentOperation);
          pollCount++;
        }

        if (!currentOperation.done) {
          throw new Error('Video generation timed out after 10 minutes');
        }

        // Get generated video
        const generatedVideo = currentOperation.response.generated_videos[0];

        // Download video to temporary location
        await client.files.download({ file: generatedVideo.video });
        const timestamp = Date.now();
        const filename = `veo3_${timestamp}.mp4`;
        generatedVideo.video.save(filename);

        console.log('[Veo3] Video generated successfully:', filename);

        return {
          success: true,
          status: 'completed',
          video: {
            filename: filename,
            duration: config.durationSeconds,
            resolution: config.resolution,
            aspectRatio: config.aspectRatio,
          },
          operation: {
            name: operation.name,
            pollCount: pollCount,
          },
          prompt: prompt,
        };
      }

      if (this.useVertexAI) {
        // Use Vertex AI for video generation
        throw new Error(
          'Vertex AI video generation not yet implemented. Please use Gemini API (GOOGLE_GEMINI_API_KEY)'
        );
      }
    } catch (error) {
      console.error('[Veo3] Error generating video:', error);
      throw error;
    }
  }

  /**
   * Helper function to sleep for a given time
   * @param {number} ms - Milliseconds to sleep
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new Veo3Service();
