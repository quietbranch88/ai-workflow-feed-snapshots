import { readFile, writeFile } from 'node:fs/promises';
import { collectSnapshot } from '../src/snapshot.mjs';
const [input, output] = process.argv.slice(2);
if (!input || !output || input === output) throw new Error('Separate input and output paths required');
const previous = JSON.parse(await readFile(input, 'utf8'));
if (!previous || typeof previous.sources !== 'object' || !previous.sources) throw new Error('Invalid previous snapshot');
const snapshot = await collectSnapshot(previous);
await writeFile(output, JSON.stringify(snapshot));
console.log(JSON.stringify({ attempted_at: snapshot.attempted_at, sources: Object.values(snapshot.sources).map(({source_id,status,fetched_at})=>({source_id,status,fetched_at})) }));
