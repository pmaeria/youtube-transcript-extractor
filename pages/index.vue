<script setup>
import { ref, computed } from 'vue';

const input = ref('');
const transcriptData = ref([]);
const loading = ref(false);
const error = ref('');

const extractVideoId = (input) => {
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  const regexes = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
  ];

  for (const regex of regexes) {
    const match = input.match(regex);
    if (match) return match[1];
  }

  return null;
};

const videoId = computed(() => {
  if (!input.value) return null;
  return extractVideoId(input.value);
});

const unescapeHtml = (text) => {
  const htmlEntities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  };
  return text.replace(/&(?:#x[a-f0-9]+|#[0-9]+|[a-z0-9]+);/gi, match => htmlEntities[match] || match);
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  transcriptData.value = [];

  if (!videoId.value) {
    error.value = 'Invalid YouTube URL or video ID';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/transcript/${videoId.value}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transcript');
    }
    const data = await response.json();
    transcriptData.value = data.map(item => ({
      ...item,
      text: item.text // Store the original text
    }));
  } catch (err) {
    error.value = `Error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const handleCopy = () => {
  const fullTranscript = transcriptData.value.map(item => unescapeHtml(item.text)).join('\n');
  navigator.clipboard.writeText(fullTranscript)
    .then(() => alert('Transcript copied to clipboard!'))
    .catch(err => console.error('Failed to copy: ', err));
};
</script>

<template>
  <main class="container">
    <h1>YouTube Transcript Extractor</h1>
    <form @submit.prevent="handleSubmit">
      <div class="grid">
        <input
          v-model="input"
          type="text"
          placeholder="Enter YouTube URL or Video ID"
          required
        />
        <button type="submit">Extract Transcript</button>
      </div>
    </form>
    <div v-if="loading" id="spinner" class="spinner"></div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="transcriptData.length" id="output">
      <button id="copyButton" @click="handleCopy" aria-label="Copy to clipboard">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <div id="transcriptContent">
        <p v-for="(item, index) in transcriptData" :key="index">
          {{ unescapeHtml(item.text) }}
        </p>
      </div>
    </div>
  </main>
</template>

<style>
@import url('https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css');

.container {
  margin: 2rem auto;
  max-width: 600px;
}

#output {
  position: relative;
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
}

#copyButton {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem;
  background: none;
  border: none;
}

#copyButton:hover {
  background: var(--primary-hover);
}

#transcriptContent {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 2.5rem; /* Add margin to prevent overlap with copy button */
}

#transcriptContent p {
  margin-bottom: 0.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--primary);
  border-top: 5px solid var(--secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
