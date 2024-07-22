
import { YoutubeTranscript } from 'youtube-transcript';

export default defineEventHandler(async (event) => {
  const { videoId } = event.context.params;

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript;
  } catch (error) {
    console.error('error', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
  
