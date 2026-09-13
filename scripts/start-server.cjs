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

// Do not print the key. Only expose a safe diagnostic for Render logs.
console.log(`[NutriAI] Gemini API key configured: ${configuredKey ? 'yes' : 'no'}`);

require('../dist/server.cjs');
