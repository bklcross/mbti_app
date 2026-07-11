const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const test = require('node:test');

const { close, exec, openDb, run } = require('../db');
const { mapQuoteResponse } = require('../gateways/quoteGateway');
const { analyzeQuoteRows } = require('../services/quoteService');

const testDbPath = path.join(os.tmpdir(), `sociable-growth-coach-${process.pid}.sqlite`);
process.env.SQLITE_DB_PATH = testDbPath;
process.env.CORS_ORIGIN = '*';

const app = require('../index');

function request(server, method, route, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      method,
      port: server.address().port,
      path: route,
      headers: payload
        ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        : {}
    };
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

test.beforeEach(() => {
  fs.rmSync(testDbPath, { force: true });
  const db = openDb();

  try {
    exec(db, fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_create_quotes.sql'), 'utf8'));
    run(
      db,
      `INSERT INTO quotes (quote_text, author, source_url, fetched_at)
       VALUES (?, ?, ?, ?)`,
      ['Keep it simple.', 'Test Author', 'test', '2026-07-11T00:00:00.000Z']
    );
  } finally {
    close(db);
  }
});

test.after(() => {
  fs.rmSync(testDbPath, { force: true });
});

test('analyzeQuoteRows returns quote summary', () => {
  const summary = analyzeQuoteRows([
    { quote_text: 'Latest', author: 'A' },
    { quote_text: 'Earlier', author: 'A' },
    { quote_text: 'Other', author: 'B' }
  ]);

  assert.equal(summary.totalQuotes, 3);
  assert.equal(summary.uniqueAuthors, 2);
  assert.equal(summary.latestQuote.quote_text, 'Latest');
});

test('mapQuoteResponse maps external API data', () => {
  const quote = mapQuoteResponse({ quote: 'Learn by doing.', author: 'Someone' });

  assert.equal(quote.quoteText, 'Learn by doing.');
  assert.equal(quote.author, 'Someone');
  assert.equal(quote.sourceUrl, 'https://dummyjson.com/quotes/random');
  assert.match(quote.fetchedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('GET /health returns ok', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, 'GET', '/health');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  } finally {
    server.close();
  }
});

test('POST /api/echo validates and echoes reflection', async () => {
  const server = app.listen(0);

  try {
    const empty = await request(server, 'POST', '/api/echo', { reflection: '' });
    const valid = await request(server, 'POST', '/api/echo', {
      reflection: 'I feel ready.'
    });

    assert.equal(empty.statusCode, 400);
    assert.equal(empty.body.message, 'Please enter a reflection.');
    assert.equal(valid.statusCode, 200);
    assert.deepEqual(valid.body, {
      message: 'Reflection received',
      echo: 'I feel ready.'
    });
  } finally {
    server.close();
  }
});

test('GET /api/quotes/analysis returns saved quote summary', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, 'GET', '/api/quotes/analysis');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.totalQuotes, 1);
    assert.equal(response.body.uniqueAuthors, 1);
    assert.equal(response.body.latestQuote.quote_text, 'Keep it simple.');
  } finally {
    server.close();
  }
});
