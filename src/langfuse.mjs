const MONTHS = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
function text(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => { const i=Number(n); return i>0 && i<=0x10ffff && !(i>=0xd800 && i<=0xdfff) ? String.fromCodePoint(i) : ''; }).replace(/\s+/g, ' ').trim().slice(0, 300);
}
export function parseLangfuse(html) {
  // Only dated article-relative paths are accepted; arbitrary origins cannot escape the allowlist.
  const cards = [...html.matchAll(/<a\b[^>]*\bhref=["'](\/blog\/(\d{4}-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*)["'][^>]*>([\s\S]*?)<\/a\s*>/gi)];
  if (!cards.length) throw new Error('Langfuse directory format not recognized');
  const seen = new Set(); const posts = [];
  for (const [,path,date,body] of cards) {
    const h3 = body.match(/<h3\b[^>]*>([\s\S]*?)<\/h3\s*>/i);
    if (!h3) continue;
    const plain = text(body); const displayed = plain.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/);
    if (!displayed) continue;
    const visibleDate = `${displayed[3]}-${MONTHS[displayed[1]]}-${displayed[2].padStart(2,'0')}`;
    const parsed = new Date(`${visibleDate}T00:00:00.000Z`);
    const title = text(h3[1]);
    if (!title || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10)!==visibleDate || seen.has(path)) continue;
    seen.add(path);
    posts.push({source_id:'langfuse', source:'Langfuse', title, url:`https://langfuse.com${path}`, published_at:visibleDate, date_source:'official directory displayed date; time and timezone unknown', excerpt:'', evidence:'Untrusted directory metadata; original article not read'});
  }
  if (!posts.length) throw new Error('Langfuse directory has no parseable article entries');
  posts.sort((a,b)=>b.published_at.localeCompare(a.published_at));
  const limited = posts.slice(0,50);
  limited.source_items_truncated = posts.length > 50;
  return limited;
}
