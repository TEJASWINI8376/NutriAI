// Render/Node startup shim for Gemini configuration.
// The Gemini SDK reads process.env.GEMINI_API_KEY. Hosting dashboards sometimes
// receive pasted values with surrounding quotes or whitespace, so normalize them
// before importing the bundled server.
function normalize(value) {
  if (!value) return '';
  let result = String(value).trim();
  if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) {
    result = result.slice(1, -1).trim();
  }
  return result;
}

const configuredKey = normalize(
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY,
);

if (configuredKey) {
  process.env.GEMINI_API_KEY = configuredKey;
}

// Use the stable API and current Flash model. The bundled server still contains
// legacy model strings, so normalize them at the SDK boundary until the next
// source rebuild. This keeps every generateContent call on the supported model.
const Module = require('node:module');
const originalLoad = Module._load;
let patchedGenAI = null;

Module._load = function patchedModuleLoad(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain);
  if (request !== '@google/genai' || patchedGenAI) return loaded;

  const OriginalGoogleGenAI = loaded.GoogleGenAI;
  if (typeof OriginalGoogleGenAI !== 'function') return loaded;

  class StableGoogleGenAI extends OriginalGoogleGenAI {
    constructor(options = {}) {
      super({
        ...options,
        httpOptions: {
          ...(options.httpOptions || {}),
          apiVersion: 'v1',
        },
      });

      if (this.models && typeof this.models.generateContent === 'function') {
        const originalGenerateContent = this.models.generateContent.bind(this.models);
        this.models.generateContent = (requestOptions = {}) => originalGenerateContent({
          ...requestOptions,
          model: requestOptions.model === 'gemini-2.5-flash' || requestOptions.model === 'models/gemini-2.5-flash'
            ? 'gemini-3.6-flash'
            : requestOptions.model,
        });
      }
    }
  }

  patchedGenAI = { ...loaded, GoogleGenAI: StableGoogleGenAI };
  return patchedGenAI;
};

// Do not print the key. Only expose safe diagnostics for Render logs.
console.log(`[NutriAI] Gemini API key configured: ${configuredKey ? 'yes' : 'no'}`);
console.log('[NutriAI] Gemini API version: v1`);
console.log('[NutriAI] Gemini model migration: gemini-2.5-flash -> gemini-3.6-flash');

require('../dist/server.cjs');
