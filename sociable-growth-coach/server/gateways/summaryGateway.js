const SUMMARY_API_URL = process.env.SUMMARY_API_URL || 'https://gen.pollinations.ai/text';

function buildSummaryPrompt(reflections) {
  return [
    'Summarize these personal reflections in 2 short sentences.',
    'Mention the main mood or theme. Do not give medical advice.',
    reflections.map((reflection) => `- ${reflection.reflection_text}`).join('\n')
  ].join('\n\n');
}

async function summarizeReflections(reflections) {
  const prompt = buildSummaryPrompt(reflections);
  const response = await fetch(`${SUMMARY_API_URL}/${encodeURIComponent(prompt)}`, {
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error(`Summary API request failed with status ${response.status}`);
  }

  return (await response.text()).trim();
}

module.exports = {
  buildSummaryPrompt,
  summarizeReflections,
  SUMMARY_API_URL
};
