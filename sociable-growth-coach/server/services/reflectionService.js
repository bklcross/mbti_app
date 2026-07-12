const { all, get, run } = require('../db');
const { summarizeReflections } = require('../gateways/summaryGateway');

function saveReflection(db, text) {
  const createdAt = new Date().toISOString();
  const result = run(
    db,
    `INSERT INTO reflections (reflection_text, created_at)
     VALUES (?, ?)`,
    [text, createdAt]
  );

  return {
    id: result.id,
    reflection_text: text,
    created_at: createdAt
  };
}

function listReflections(db) {
  return all(
    db,
    `SELECT id, reflection_text, created_at
     FROM reflections
     ORDER BY created_at DESC, id DESC`
  );
}

function getReflectionStats(db) {
  const total = get(db, `SELECT COUNT(*) AS totalReflections FROM reflections`);
  const latestReflection = get(
    db,
    `SELECT id, reflection_text, created_at
     FROM reflections
     ORDER BY created_at DESC, id DESC
     LIMIT 1`
  );

  return {
    totalReflections: total.totalReflections,
    latestReflection: latestReflection || null
  };
}

function buildLocalSummary(reflections) {
  if (reflections.length === 0) {
    return 'No reflections have been submitted yet.';
  }

  const latest = reflections[0].reflection_text;
  return `You have submitted ${reflections.length} reflection${reflections.length === 1 ? '' : 's'}. Latest reflection: ${latest}`;
}

async function getReflectionSummary(db, summarize = summarizeReflections) {
  const reflections = listReflections(db);

  if (reflections.length === 0) {
    return {
      totalReflections: 0,
      latestReflection: null,
      summary: 'No reflections have been submitted yet.',
      summarySource: 'local'
    };
  }

  try {
    return {
      totalReflections: reflections.length,
      latestReflection: reflections[0],
      summary: await summarize(reflections.slice(0, 10)),
      summarySource: 'ml-api'
    };
  } catch (error) {
    return {
      totalReflections: reflections.length,
      latestReflection: reflections[0],
      summary: buildLocalSummary(reflections),
      summarySource: 'local'
    };
  }
}

module.exports = {
  buildLocalSummary,
  getReflectionStats,
  getReflectionSummary,
  listReflections,
  saveReflection
};
