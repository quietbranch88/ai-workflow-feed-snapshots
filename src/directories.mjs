// Pure parsers for observed public directory markup. The caller must bound the
// response size and reject redirects before passing its body here.
const MAX_ITEMS = 100;

function cleanText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/gi, (entity) => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&#x27;':"'"})[entity.toLowerCase()] ?? entity).replace(/\s+/g, ' ').trim().slice(0, 300);
}

function validDay(year, month, day) {
  const date = `${year}-${month}-${day}`;
  const milliseconds = Date.parse(`${date}T00:00:00.000Z`);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString().startsWith(date) ? new Date(milliseconds).toISOString() : null;
}

function buildPost(sourceId, source, href, title, publishedAt, pathPattern, origin) {
  if (!title || !publishedAt || !pathPattern.test(href)) return null;
  const parsed = new URL(href, origin);
  if (parsed.origin !== origin || parsed.username || parsed.password) return null;
  return { source_id: sourceId, source, provenance: 'Official public article directory', title, url: parsed.href, published_at: publishedAt,
    date_source: 'directory date only; time and timezone not verified', excerpt: '', evidence: 'Untrusted directory metadata; original article not read' };
}

export function parseCodesaiDirectory(html) {
  if (typeof html !== 'string') throw new Error('Invalid Codesai directory');
  const blocks = [...html.matchAll(/<div\s+class=["']post["']\s*>([\s\S]*?)(?=<div\s+class=["']post["']\s*>|<\/main\s*>|$)/gi)];
  if (!blocks.length) throw new Error('Codesai article directory format not recognized');
  const posts = blocks.slice(0, MAX_ITEMS).flatMap(([, body]) => {
    const match = body.match(/<h2\b[^>]*>\s*<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a\s*>\s*<\/h2\s*>\s*<p\b[^>]*>\s*(\d{2})\/(\d{2})\/(\d{4})\s*<\/p\s*>/i);
    if (!match) return [];
    const post = buildPost('codesai', 'Codesai', match[1], cleanText(match[2]), validDay(match[5], match[4], match[3]), /^\/posts\/\d{4}\/\d{2}\/[a-z0-9][a-z0-9-]*\/?$/i, 'https://codesai.com');
    return post ? [post] : [];
  });
  if (!posts.length) throw new Error('Codesai directory had no parseable entries');
  posts.source_items_truncated = blocks.length > MAX_ITEMS;
  return posts;
}

export function parseClaudeCommunityDirectory(html) {
  if (typeof html !== 'string') throw new Error('Invalid Claude Community directory');
  const blocks = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)].filter(([, attrs]) => /\bclass\s*=\s*["'][^"']*\bblog-card\b[^"']*["']/i.test(attrs));
  if (!blocks.length) throw new Error('Claude Community directory format not recognized');
  const posts = blocks.slice(0, MAX_ITEMS).flatMap(([, attrs, body]) => {
    const href = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
    const title = cleanText(body.match(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/i)?.[1]);
    const date = body.match(/<time\b[^>]*\bdatetime\s*=\s*["'](\d{4})-(\d{2})-(\d{2})["'][^>]*>/i);
    if (!date) return [];
    const post = buildPost('claudecommunity', 'Claude Community', href, title, validDay(date[1], date[2], date[3]), /^\/zh-TW\/lab\/[a-z0-9][a-z0-9-]*\/?$/i, 'https://www.claudecommunity.com');
    return post ? [post] : [];
  });
  if (!posts.length) throw new Error('Claude Community directory had no parseable entries');
  posts.source_items_truncated = blocks.length > MAX_ITEMS;
  return posts;
}
