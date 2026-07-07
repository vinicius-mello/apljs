import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

const ROOT = path.resolve('.');
const OLD_FILE = path.join(ROOT, 'apl.js.old');
const NEW_FILE = path.join(ROOT, 'apl.js');

const SAMPLES = [
  '1+2',
  '+/1 2 3 4',
  'a←1⋄a+2',
  '(+ 1)',
  '1 2 3 + 4 5 6',
  '{⍵+1} 10',
  'x←3⋄y←4⋄x+y',
  '1<2:3',
  '((1+2)+3)+4',
  '⍳10',
];

const ITERATIONS = 3000;

function loadModuleLike(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const withoutExport = src.replace(/\nexport\s*\{[\s\S]*?\};\s*$/, '\n');
  const wrapped = `${withoutExport}\n;globalThis.__aplExports = { tokenizer, breakExpressions, parseExpression, parser, aplToJavaScript, evaluateApl, G, global_category };`;

  const context = {
    console,
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Set,
    Map,
    Error,
    TypeError,
    SyntaxError,
    JSON,
    globalThis: null,
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(wrapped, context, { filename: path.basename(filePath) });
  return context.__aplExports;
}

function assertEquivalent(oldMod, newMod) {
  for (const src of SAMPLES) {
    const oldJs = oldMod.aplToJavaScript(src);
    const newJs = newMod.aplToJavaScript(src);
    if (oldJs !== newJs) {
      throw new Error(`Divergence for input: ${src}\nOLD: ${oldJs}\nNEW: ${newJs}`);
    }
  }
}

function runBench(name, fn) {
  const t0 = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    for (const src of SAMPLES) {
      fn(src);
    }
  }
  const t1 = performance.now();
  return t1 - t0;
}

function formatMs(ms) {
  return `${ms.toFixed(2)} ms`;
}

function main() {
  if (!fs.existsSync(OLD_FILE)) {
    throw new Error('Missing apl.js.old backup file.');
  }

  const oldMod = loadModuleLike(OLD_FILE);
  const newMod = loadModuleLike(NEW_FILE);

  assertEquivalent(oldMod, newMod);

  // Warmup to reduce one-time JIT noise.
  runBench('warmup-old', (src) => oldMod.aplToJavaScript(src));
  runBench('warmup-new', (src) => newMod.aplToJavaScript(src));

  const oldTime = runBench('old', (src) => oldMod.aplToJavaScript(src));
  const newTime = runBench('new', (src) => newMod.aplToJavaScript(src));

  const deltaMs = oldTime - newTime;
  const speedup = oldTime / newTime;
  const deltaPct = (deltaMs / oldTime) * 100;

  console.log('Benchmark: aplToJavaScript over parser/reduceStack');
  console.log(`Samples: ${SAMPLES.length}`);
  console.log(`Iterations per sample: ${ITERATIONS}`);
  console.log(`Old: ${formatMs(oldTime)}`);
  console.log(`New: ${formatMs(newTime)}`);
  console.log(`Delta: ${formatMs(deltaMs)} (${deltaPct.toFixed(2)}%)`);
  console.log(`Speedup: ${speedup.toFixed(3)}x`);
}

main();
