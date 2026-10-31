const MONTHS = { January:'01', February:'02', March:'03', April:'04', May:'05', June:'06', July:'07', August:'08', September:'09', October:'10', November:'11', December:'12' };
function plain(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_,n) => {const v=Number(n); return v>0 && v<=0x10ffff && !(v>=0xd800 && v<=0xdfff) ? String.fromCodePoint(v) : '';}).replace(/\s+/g,' ').trim();
}
function dated(s) {
  const m=plain(s).match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})\b/);
  if (!m) return null;
  const d=`${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2,'0')}`, dt=new Date(`${d}T00:00:00.000Z`);
  return Number.isFinite(dt.getTime()) && dt.toISOString().slice(0,10)===d ? d : null;
}
function bounded(html) { if (typeof html!=='string' || new TextEncoder().encode(html).byteLength>1_000_000) throw new Error('Directory response exceeds limit or is invalid'); }
function parse(html, {name, id, origin, prefix, headline, dateText}) {
  bounded(html); const cards=[...html.matchAll(/<a\b[^>]*\bhref=["'](\/(?:blog|news)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a\s*>/gi)];
  const out=[]; const seen=new Set();
  for (const [,path,body] of cards) {
    // Accept only one relative slug and add the origin ourselves.
    if (!path.startsWith(prefix) || !/^[a-z0-9]+(?:-[a-z0-9]+)*\/?$/i.test(path.slice(prefix.length))) continue;
    const title=plain(headline(body)??'').slice(0,300); const date=dated(dateText(body)??'');
    if (!title || !date || seen.has(path)) continue;
    seen.add(path);out.push({source_id:id,source:name,title,url:`${origin}${path}`,published_at:date,date_source:'official directory displayed date; time and timezone unknown',excerpt:'',evidence:'Untrusted directory metadata; original article not read'});
  }
  if (!out.length) throw new Error(`${name} directory has no parseable article entries`);
  out.sort((a,b)=>b.published_at.localeCompare(a.published_at));
  const limited=out.slice(0,50); limited.source_items_truncated=out.length>50; return limited;
}
export function parseHaystack(html) { return parse(html,{id:'deepset',name:'deepset / Haystack',origin:'https://haystack.deepset.ai',prefix:'/blog/',headline:s=>s.match(/<h2\b[^>]*>([\s\S]*?)<\/h2\s*>/i)?.[1],dateText:s=>s.match(/<span\b[^>]*\bclass=["'][^"']*\bdate\b[^"']*["'][^>]*>([\s\S]*?)<\/span\s*>/i)?.[1]}); }
export function parseJina(html) { return parse(html,{id:'jina',name:'Jina AI',origin:'https://jina.ai',prefix:'/news/',headline:s=>s.match(/<div\b[^>]*\bclass=["'][^"']*\btext-h6\b[^"']*["'][^>]*>([\s\S]*?)<\/div\s*>/i)?.[1],dateText:s=>[...s.matchAll(/<div\b[^>]*\bclass=["'][^"']*\btext-caption\b[^"']*["'][^>]*>([^<]*?)<\/div\s*>/gi)].map(m=>m[1]).find(v=>dated(v))}); }
