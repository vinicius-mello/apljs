
const tokenizer = (text) => {
  const tokens = [];
  const specs = [
    { regex: /^([\r\n]|⋄)+/u, type: 'SEPARATOR' },
    { regex: /^⍝[^\n]*/u, type: 'COMMENT' },
    { regex: /^(⍺{1,2}|⍵{1,2}|∇{1,2}|[⍶⍹⍙])/u, type: 'SPECIAL_VAR' },
    { regex: /^\s+/, type: 'WHITESPACE' },
    { regex: /^[¯]?\d+(\.\d+)?/u, type: 'NUMBER' },
    { regex: /^'[^'\\]*(?:\\.[^'\\]*)*'/, type: 'STRING' },
    { regex: /^#[0-9\p{L}\-]+/u, type: 'STRING' },
    { regex: /^\(/, type: 'PAREN_OPEN' },
    { regex: /^\)/, type: 'PAREN_CLOSE' },
    { regex: /^\{/, type: 'BRACE_OPEN' },
    { regex: /^\}/, type: 'BRACE_CLOSE' },
    { regex: /^←/u, type: 'ASSIGN' },
    { regex: /^:/, type: 'GUARD' },
    { regex: /^∘\./u, type: 'SYMBOL' },
    { regex: /^[@\\!\?\*¨,-\/\p{Math}\p{Sm}\p{So}]/u, type: 'SYMBOL' },
    { regex: /^[\p{L}_][\p{L}0-9_]*/u, type: 'IDENTIFIER' }
  ];
    
  let cursor = 0;

  while (cursor < text.length) {
    let matched = false;
    for (const spec of specs) {
      const match = text.slice(cursor).match(spec.regex);
      if (match) {
        if (spec.type !== 'WHITESPACE' && spec.type !== 'COMMENT') {
          if(spec.type === 'STRING' && match[0].startsWith('#')) {
            console.log('String with # prefix detected:', match[0]);
            const strContent = "'"+match[0].slice(1)+"'";
            tokens.push({ type: spec.type, value: strContent });
          } else {
            tokens.push({ type: spec.type, value: match[0] });
          }
        }
        cursor += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error(`Unexpected character: "${text[cursor]}"`);
    }
  }
  return tokens;
};

const global_category = {
  '+': { category:'F', name: 'plus' },
  '-': { category:'F', name: 'minus' },
  '×': { category:'F', name: 'times' },
  '÷': { category:'F', name: 'divide' },
  '⌈': { category:'F', name: 'ceiling' },
  '⌊': { category:'F', name: 'floor' },
  '=': { category:'F', name: 'equals' },
  '≠': { category:'F', name: 'not_equals' },
  '<': { category:'F', name: 'less_than' },
  '>': { category:'F', name: 'greater_than' },
  '≤': { category:'F', name: 'less_than_or_equal' },
  '≥': { category:'F', name: 'greater_than_or_equal' },
  '|': { category:'F', name: 'residue' },
  '⍴': { category:'F', name: 'rho' },
  '/': { category:'F', name: 'compress' },
  '⌿': { category:'M', name: 'reduce' },
  '⍀': { category:'M', name: 'scan' },
  '⍨': { category:'M', name: 'selfie' },
  ',': { category:'F', name: 'comma' },
  '⍪': { category:'F', name: 'double_comma' },
  '⍳': { category:'F', name: 'iota' },
  '⍋': { category:'F', name: 'grade_up' },
  '⍒': { category:'F', name: 'grade_down' },
  '⍣': { category:'D', name: 'power' },
  '∇': { category:'F', name: '_del_' },
  '∇∇': { category:'D', name: '_ddel_' },
  '⍺': { category:'V', name: '_a_' },
  '⍵': { category:'V', name: '_w_' },
  '⍺⍺': { category:'F', name: '_aa_' },
  '⍵⍵': { category:'F', name: '_ww_' },
  '⍶': { category:'V', name: '_aa_' },
  '⍹': { category:'V', name: '_ww_' },
  '≢': { category:'F', name: 'tally' },
  '⎕': { category:'V', name: 'quad' },
  '⊢': { category:'F', name: 'right' },
  '⊣': { category:'F', name: 'left' },
  '.': { category:'D', name: 'dot' },
  '∘.': { category:'M', name: 'outer' },
  '∘': { category:'D', name: 'jot' },
  '⍬': { category:'V', name: 'zilde' },
  '⌽': { category:'F', name: 'reverse' },
  '¨': { category:'M', name: 'each' },
  '*': { category:'F', name: 'exp' },
  '⍟': { category:'F', name: 'log' },
  '?' : { category:'F', name: 'deal' },
  '≡': { category:'F', name: 'match' },
  '!': { category:'F', name: 'factorial' },
  '∨': { category:'F', name: 'or' },
  '∧': { category:'F', name: 'and' },
  '~': { category:'F', name: 'not' },
  '⍲': { category:'F', name: 'nand' },
  '⍱': { category:'F', name: 'nor' },
  '⍉': { category:'F', name: 'transpose' },
  '⌷': { category:'F', name: 'squad' },
  '⊂': { category:'F', name: 'enclose' },
  '@': { category:'D', name: 'at' },
  '↑': { category:'F', name: 'take' },
  '↓': { category:'F', name: 'drop' },
  '⍣': { category:'D', name: 'power' },
  '⍥': { category:'D', name: 'over' },
  '⍠': { category:'F', name: 'qcolon' },
  '⍞': { category:'F', name: 'qquote' }
}

const _a_ = global_category['⍺'].name;
const _w_ = global_category['⍵'].name;
const _aa_ = global_category['⍺⍺'].name;
const _ww_ = global_category['⍵⍵'].name;

const mdfunc = (m,d,w,a) => {
  if(a === undefined) {
    if (typeof w === 'number') {
      return m(w);
    } else if (Array.isArray(w)) {
      return w.map(x => mdfunc(m,d,x));
    } else {
      throw new Error('Unsupported type for negation');
    }
  }
  if (typeof w === 'number' && typeof a === 'number') {
    return d(w, a);
  } 
  if (Array.isArray(w) && typeof a === 'number') {
    return w.map(x => mdfunc(m,d,x,a));
  }
  if (typeof w === 'number' && Array.isArray(a)) {
    return a.map(x => mdfunc(m,d,w,x));
  }
  if (Array.isArray(w) && Array.isArray(a)) {
    if (w.length !== a.length) {
      throw new Error('Arrays must be of the same length for element-wise subtraction.');
    }
    return a.map((x, i) => mdfunc(m,d,w[i],x));
  } else {
    throw new Error('Unsupported types for subtraction');
  }
}

const matchRec = (w, a) => {
  if (typeof w === 'number' && typeof a === 'number') {
    return w === a ? 1 : 0;
  }
  if (typeof w === 'string' && typeof a === 'string') {
    return w === a ? 1 : 0;
  }
  if (Array.isArray(w) && Array.isArray(a)) { 
    if (w.length !== a.length) 
      return 0;
    for (let i = 0; i < w.length; i++) {
      if (matchRec(w[i], a[i]) === 0) {
        return 0;
      }
    }
    return 1;
  }
  return 0;
};

const factorial = (n) => {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  } 
  if (n === 0) {
    return 1;
  }
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
};

const binomial = (n, k) => {
  if (k < 0 || k > n) {
    return 0;
  }
  return factorial(n) / (factorial(k) * factorial(n - k));
};

const gcd = (a, b) => {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
};

const lcm = (a, b) => {
  if (a === 0 || b === 0) {
    return 0;
  }
  return Math.abs(a * b) / gcd(a, b);
};

const drel = (f, w, a) => {
  if (typeof w === 'number' && typeof a === 'number') {
    return f(w, a) ? 1 : 0;
  }
  if(typeof w === 'string' && typeof a === 'string') {
    if(a.length===1) {
      return w.split('').map(x => f(x, a) ? 1 : 0);
    }
    if(w.length===1) {
      return a.split('').map(x => f(w, x) ? 1 : 0);
    }
    if(w.length===a.length) {
      return a.split('').map((x,i) => f(w[i], x) ? 1 : 0);
    }
  }
  if(!Array.isArray(a) && Array.isArray(w)) {
    return w.map(x => drel(f, x, a));
  }
  if(Array.isArray(a) && !Array.isArray(w)) {
    return a.map(x => drel(f, w, x));
  }
  if(Array.isArray(a) && Array.isArray(w)) {
    if (a.length !== w.length) {
      throw new Error('Arrays must be of the same length for element-wise comparison.');
    }
    return a.map((x, i) => drel(f, w[i], x));
  }
  throw new Error('Unsupported types for comparison');
}

const transposeRec = (a) => {
  if (!Array.isArray(a) || !Array.isArray(a[0])) {  
    return a;
  }
  const result = [];
  const rows = a.length;
  for(let i=0; i<a[0].length; i++) {
    const newRow = transposeRec(a.map(row => row[i]));
    result.push(newRow);
  }
  return result;
};

const shapeRec = (arr) => {
  if(!Array.isArray(arr)) {
    return [];
  }
  const shape = shapeRec(arr[0]);
  shape.splice(0,0,arr.length);
  return shape;      
}

const fillShapeRec = (shape0, fillFunc) => {
  let index = 0;
  const fshape = (prefix, cellshape) => {
    if (cellshape.length === 0)
      return fillFunc(prefix, index++);  
    let sl = cellshape.slice(1);
    let result = [];
    for (let i = 0; i < cellshape[0]; i++) {
      const subArray = fshape(prefix.concat(i), sl);
      result.push(subArray);
    }
    return result;
  };
  return fshape([], shape0);
};

const at = (arr, idx) => {
  let result = arr;
  for (let i = 0; i < idx.length; i++) {
    result = result[idx[i]];
  }
  return result;
};

const assignRec = (arr, idx, value) => {
  if(typeof idx === 'number') {
    arr[idx] = value;
  }
  let result = arr;
  for (let i = 0; i < idx.length - 1; i++) {
    result = result[idx[i]];
  }
  result[idx[idx.length - 1]] = value;
};

const getRec = (arr, idx) => {
  if (typeof idx === 'number') {
    return arr[idx];
  }
  if (!Array.isArray(idx)) {
    throw new Error('Unsupported index type');
  }
  if (idx.length === 0) {
    return arr;
  }
  const t = idx[0];
  const rest = idx.slice(1);
  if (typeof t === 'number') {
    return getRec(arr[t], rest);
  }
  const result = [];
  for (let i = 0; i < t.length; i++) {
    result.push(getRec(arr[t[i]], rest));
  }
  return result;
};
  
const G = {
  qcolon: (w, a) => {
    if (a===undefined) {
      return eval(w);
    }
    for(let i=0;i<w.length;i++) {
      const cmd = w[i];
      a=a[cmd[0]](...cmd.slice(1));
    }
    return a;
  },
  qquote: (w, a) => {
    if(a === undefined) {      
      const result = {};
      for(let i=0;i<w.length;i++) {
        const cmd = w[i];
        if(cmd.length === 2) {
          result[cmd[0]] = cmd[1];
        } else {
          result[cmd[0]] = cmd.slice(1);
        }
      }
      return result;
    }
    return a[w];
  },
  zilde: [],
  set quad(value) {
    console.log('⎕:', value);
  },
  right: (w) => w,
  left: (w,a) => (a===undefined?w:a),
  each: (f)=>(w, a) => {
    if (typeof f !== 'function') {
      throw new Error('Each requires a function');
    }
    if (Array.isArray(w)) {
      return w.map(x => f(x, a));
    } else {
      return f(w, a);
    }
  },
  power: (f, g)=>(w, a) => {
    if (typeof f !== 'function') {
      throw new Error('Power requires a function');
    }
    if (typeof g === 'number') {
      let result = w;
      for (let i = 0; i < g; i++) {
        result = f(result, a);
      }
      return result;
    }
    if (typeof g === 'function') {
      let result = w;
      let newResult;
      let iterations = 100000; // Prevent infinite loops
      while (g(result, newResult=f(result, a)) === 0 && iterations > 0) {
        result = newResult;
        iterations--;
      }
      return result;
    }
    throw new Error('Power requires a function or a number');
  },
  reverse: (w) => {
    if (Array.isArray(w)) {
      return w.slice().reverse();
    } else if (typeof w === 'string') {
      return w.split('').reverse().join('');
    } else {
      throw new Error('Unsupported type for reverse');
    }
  },
  selfie: (f)=>(w, a) => {
    if(typeof f !== 'function')
      return f;
    if (a===undefined) {
      return f(w, w);
    }
    return f(a, w);
  },
  over: (f,g)=>(w, a) => {
    return f(g(w), a!==undefined ? g(a) : a);
  },
  rho: (w, a) => {
    if (a===undefined) {
      return shapeRec(w);
    }
    if (!Array.isArray(w)) {
      w = [w];
    }
    if (!Array.isArray(a)) {
      a = [a];
    }
    const m = w.length;
    return fillShapeRec(a, (prefix, index) => w[index % m]);
  },
  match: (w, a) => {
    return matchRec(w, a);  
  },
  tally: (w, a) => {
    if (a !== undefined) {
      return matchRec(w, a)===1 ? 0 : 1; 
    }
    if (Array.isArray(w)||typeof w === 'string') {
      return w.length;
    } else {
      throw new Error('Unsupported type for tally');
    }
  }, 
  compress: (w, a) => {
    if (typeof w === 'string' && Array.isArray(a)) {
      w = w.split('');
      let result = '';
      for (let i = 0; i < w.length; i++) {
        for(let j = 0; j < a[i]; j++) {
          result = result + w[i];
        }
      }
      return result;
    }
    if(!Array.isArray(w) || !Array.isArray(a)) {
      throw new Error('Unsupported types for compress');
    }
    const result = [];
    for (let i = 0; i < w.length; i++) {
      for(let j = 0; j < a[i]; j++) {
        result.push(w[i]);
      }
    }
    return result;
  },
  deal: (w, a) => {
    if(a===undefined) {
      return mdfunc(x => Math.floor(Math.random() * x), undefined, w);
    } else {
      if (typeof w === 'number' && typeof a === 'number') {
        const result = [];
        for (let i = 0; i < a; i++) {
          result.push(Math.floor(Math.random() * w));
        }
        return result;
      } else {
        throw new Error('Unsupported types for deal');
      }
    }
  },
  outer: (f) => (w, a) => {
    if (typeof f !== 'function') {
      throw new Error('Outer requires a function');
    }
    const result = [];
    for (let i = 0; i < a.length; i++) {
      const row = [];
      for (let j = 0; j < w.length; j++) {
        row.push(f(w[j], a[i]));
      }
      result.push(row);
    }
    return result;
  },
  dot: (aa,ww) => (w, a) => {
    if (typeof aa !== 'function' || typeof ww !== 'function') {
      throw new Error('Dot requires two functions');
    }
    const sw = shapeRec(w);
    const sa = shapeRec(a);
    if(sa.at(-1) !== sw.at(0)) {
      throw new Error('Incompatible shapes for dot product');
    }
    const resultShape = sa.slice(0, -1).concat(sw.slice(1));
    w = transposeRec(w);
    return fillShapeRec(resultShape, (prefix, index) => {
      const lidx = prefix.slice(0, sa.length - 1);
      const ridx = prefix.slice(sa.length - 1);
      const left = at(a, lidx);
      const right = at(w, ridx);
      const result = ww(right, left);
      return result.reduceRight(aa);      
    });
  },
  equals: (w,a) => {
    return drel((x,y) => y===x, w, a);
  },
  not_equals: (w, a) => {
    return drel((x,y) => y!==x, w, a); 
  },
  less_than: (w, a) => {
    return drel((x,y) => y<x, w, a);
  },
  less_than_or_equal: (w, a) => {
    return drel((x,y) => y<=x, w, a); 
  },
  greater_than: (w, a) => {
    return drel((x,y) => y>x, w, a);
  },
  greater_than_or_equal: (w, a) => {
    return drel((x,y) => y>=x, w, a);
  },
  residue: (w, a) => {
    return mdfunc(x => Math.abs(x), (x,y) => x % y, w, a);
  },
  divide: (w, a) => {
    return mdfunc(x => 1/x, (x,y) => y/x, w, a);
  },
  plus: (w, a) => {
    return mdfunc(x => x, (x,y) => y+x, w, a);
  },
  minus: (w, a) => {
    return mdfunc(x => -x, (x,y) => y-x, w, a);
  },
  times: (w, a) => {
    return mdfunc(x => x>0?1:x<0?-1:0, (x,y) => y*x, w, a);  
  },
  ceiling: (w, a) => {
    return mdfunc(x => Math.ceil(x), (x,y) => Math.max(x, y), w, a);
  },
  floor: (w, a) => {
    return mdfunc(x => Math.floor(x), (x,y) => Math.min(x, y), w, a);
  },
  exp: (w, a) => {
    return mdfunc(x => Math.exp(x), (x,y) => Math.pow(y, x), w, a);
  },
  log: (w, a) => {
    return mdfunc(x => Math.log(x), (x,y) => Math.log(x) / Math.log(y), w, a);
  },
  factorial: (w, a) => {
    return mdfunc(x => factorial(x), (x,y) => binomial(x, y), w, a);
  },
  or: (w, a) => {
    return mdfunc(x => x, (x,y) => gcd(x, y), w, a);
  },
  and: (w, a) => {
    return mdfunc(x => x, (x,y) => lcm(x, y), w, a);
  },
  nand: (w, a) => {
    return mdfunc(x => x, (x,y) => x===0||y===0?1:0, w, a);  
  },
  nor: (w, a) => {
    return mdfunc(x => x, (x,y) => x===0&&y===0?1:0, w, a);  
  },
  iota: (n) => {
    if (Array.isArray(n)) {
      return fillShapeRec(n, (idx, index) => idx);
    }
    if (typeof n === 'number') {
      return Array.from({ length: n }, (_, i) => i);
    }
    throw new Error('Unsupported type for iota');
  },
  jot: (f, g) => (w, a) => {
    if(typeof f !== 'function') {
      return g(f, w);
    }
    if(typeof g !== 'function') {
      return f(w, g);
    }
    return f(g(w),a);      
  },
  reduce: ((f) => (a) => {
    if (!Array.isArray(a)) {
      throw new Error('Reduce requires an array');
    }
    if (a.length === 0) {
      throw new Error('Reduce cannot be applied to an empty array');
    }
    return a.reduceRight(f);
  }),
  scan: ((f) => (a) => {
    if (!Array.isArray(a)) {
      throw new Error('Scan requires an array');
    }
    if (a.length === 0) {
      throw new Error('Scan cannot be applied to an empty array');
    }
    const result = [];
    let acc = a[0];
    result.push(acc);
    for (let i = 1; i < a.length; i++) {
      acc = f(acc, a[i]);
      result.push(acc);
    }
    return result;
  }),
  comma: (w, a) => {
    if (a === undefined) {
      if (Array.isArray(w)) {
        return w.flat();
      } else {
        return [w];
      }
    }
    if (Array.isArray(a) && Array.isArray(w)) {
      return a.concat(w);
    } else if (Array.isArray(a)) {
      return a.concat([w]);
    } else if (Array.isArray(w)) {
      return [a].concat(w);
    } else {
      return [a, w];
    }
  },
  transpose: (a) => {
    return transposeRec(a);
  },
  squad: (w, a) => {
    return getRec(w, a);
  },
  at: (f,g) => (w, a) => {
    if(typeof f === 'function' && typeof g === 'function') {
      return fillShapeRec(shapeRec(w), (prefix, index) => {
        const v = at(w, prefix);
        return g(v)==1 ? f(v, a) : v;
      });
    }
    if(Array.isArray(g)) {
      if(Array.isArray(f)) {
        if(f.length !== g.length)
          throw new Error('Array lengths must match');
      } else
        f = Array.apply(null, {length: g.length}).map(() => f);
      const result = fillShapeRec(shapeRec(w), (prefix, index) => {
        return at(w, prefix);
      });
      for(let i=0; i<g.length; i++) {
        const idx = g[i];
        assignRec(result, idx, f[i]);
      }
      return result;
    }
    throw new Error('Unsupported usage of at');
  },
  grade_up: (w) => {
    if (!Array.isArray(w)) {
      throw new Error('Grade up requires an array');
    }
    return w.map((v, i) => {return {i, v}})
          .sort((a, b) => {return a.v > b.v ? 1 : a.v == b.v ? 0 : -1 })
          .map((obj) => obj.i);
  },
  grade_down: (w) => {
    if (!Array.isArray(w)) {
      throw new Error('Grade down requires an array');
    }
    return w.map((v, i) => {return {i, v}})
          .sort((a, b) => {return a.v < b.v ? 1 : a.v == b.v ? 0 : -1 })
          .map((obj) => obj.i);
  },
  enclose: (w, a) => {
    return [w];
  },
  take: (w, a) => {
    if (!Array.isArray(w)) {
      throw new Error('Take requires an array');
    }
    if (typeof a === 'number') {
      a = [a];
    }
    const shape = shapeRec(w);
    const resultShape = shape.slice();
    if (a.length > resultShape.length) {
      throw new Error('Take shape has more dimensions than the array');
    }
    for (let i = 0; i < a.length; i++) {
      resultShape[i] = Math.abs(a[i]);
    }
    const result = fillShapeRec(resultShape, (prefix, index) => {
      const idx = prefix.slice();
      for (let i = 0; i < a.length; i++) {
        idx[i] = a[i] < 0 ? prefix[i] + shape[i]+a[i] : prefix[i];
        if (idx[i] >= shape[i] || idx[i] < 0) {
          return 0;
        }
      }
      return at(w, idx);
    });
    return result;
  },
  drop: (w, a) => {
    if (!Array.isArray(w)) {
      throw new Error('Drop requires an array');
    }
    if (typeof a === 'number') {
      a = [a];
    }
    const shape = shapeRec(w);
    const resultShape = shape.slice();
    if (a.length > resultShape.length) {
      throw new Error('Drop shape has more dimensions than the array');
    }
    for (let i = 0; i < a.length; i++) {
      resultShape[i] = Math.max(0, shape[i] - Math.abs(a[i]));
    }
    const result = fillShapeRec(resultShape, (prefix, index) => {
      const idx = prefix.slice();
      for (let i = 0; i < a.length; i++) {
        idx[i] = a[i] < 0 ? prefix[i] : prefix[i] + a[i];
        if (idx[i] >= shape[i] || idx[i] < 0) {
          return 0;
        }
      }
      return at(w, idx);
    });
    return result;
  }
};

const find_category = (name, scope) => {
  for (let i = scope.length - 1; i >= 0; i--) {
    if (scope[i].hasOwnProperty(name)) {
      return [scope[i][name], i==0];
    }
  }
  return [null, scope.length === 1];
}

const dfn_or_dop = (subExpressions) => {
  let countAlpha = 0;
  let countOmega = 0;
  for (const subExpression of subExpressions) {
    for (const token of subExpression) {
      if (token.type === 'SPECIAL_VAR' && 
         (token.value === '⍺⍺'||token.value === '⍶')) {
        countAlpha++;
      } else if (token.type === 'SPECIAL_VAR' && 
         (token.value === '⍹')) {
        countOmega++;
      }
    }
  }
  if (countAlpha>0) {
    if (countOmega>0)
      return 'DOPD';
    return 'DOPM';
  }
  return 'DFN';
}

const breakExpressions = (tokens, from) => {
  const expressions = [];
  let i = from;
  let currentExpression = [];
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.type === 'SEPARATOR') {
      if (currentExpression.length > 0) {
        expressions.push(currentExpression);
        currentExpression = [];
      }
    } else if (token.type === 'BRACE_OPEN') {
      const [subExpressions, newIndex] = breakExpressions(tokens, i + 1);
      const type = dfn_or_dop(subExpressions);
      currentExpression.push({ type, value: subExpressions });
      i = newIndex;
    } else if (token.type === 'BRACE_CLOSE') {
      break;
    } else {
      currentExpression.push(token);
    }
    i++;
  }
  if (currentExpression.length > 0) {
    expressions.push(currentExpression);
  } 

  return [expressions, i];
}

const parseExpression = (expression, scope) => {
  const stack = [];

  const belong = (category, list) => {
    return list.includes(category);
  }
  const countInitialBrackets = (text) => {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '[') count++;
      else break;
    }
    return count;
  };
  const reduceStack = () => {
    let foundReduction = true;
    while (foundReduction) {
      foundReduction = false;
      const size = stack.length;
      if (size === 0) break;
      // Mapping the 4-element viewport from the top of the stack (D, C, B, A)
      // The most recently added element (top) is at the end of the JavaScript array
      const A = size >= 1 ? stack[size - 1] : null;
      const B = size >= 2 ? stack[size - 2] : null;
      const C = size >= 3 ? stack[size - 3] : null;
      const D = size >= 4 ? stack[size - 4] : null;
      const AB = A && B;
      const ABC = AB && C;
      const ABCD = ABC && D;
      // if (AB && !ABC && !ABCD) {
      //   console.log('Stack top 2:', A, B); 
      // }
      // if(ABC && !ABCD) {
      //   console.log('Stack top 3:', A, B, C); 
      // }
      // if(ABCD) {
      //   console.log('Stack top 4:', A, B, C, D); 
      // }
      if (ABC && 
        A.category === '(' && 
        belong(B.category, ['V','F','D', 'M']) &&
        C.category === ')'
      ) {
        //console.log('Found parentheses:', B.text);  
        let newText = B.text;
        stack.splice(size - 3, 3, { category: B.category, text: newText });
        foundReduction = true;
        continue;
      }
      if (ABC && 
        !belong(A.category, ['V', ')']) && 
        B.category === 'V' &&
        C.category === 'V'
      ) {
        //console.log('Found strand:',A,B,C);
        stack.pop();
        let newText = '[';
        while (stack.length > 0 && stack[stack.length - 1].category === 'V') {
          const top = stack.pop();
          newText += top.text;
          if(stack.length > 0 && stack[stack.length - 1].category === 'V') newText += ', ';
        }
        newText += ']';
        stack.push({ category: 'V', text: newText })
        stack.push(A);          
        foundReduction = true;
        continue;
      }
      if(ABC &&
        belong(A.category, ['F', '(', '←', 'Edge', ':']) &&
        B.category === 'F' &&
        C.category === 'V'
      ) {
        //console.log('Found function application:', B.text, C.text);
        const newText = `${B.text}(${C.text})`;
        stack.splice(size - 3, 3, 
          { category: 'V', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        belong(A.category, ['M', 'V', 'F', '(', '←', 'Edge', ':']) &&
        B.category === 'F' &&
        C.category === 'F' &&
        D.category === 'V'
      ) {
        //console.log('Found function application:', B.text, C.text, D.text);
        const newText = `${C.text}(${D.text})`;
        stack.splice(size - 4, 4, 
          { category: 'V', text: newText }, B, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        belong(A.category, ['M', /*'V',*/ 'F', '(', '←', 'Edge', ':']) &&
        B.category === 'V' &&
        C.category === 'F' &&
        D.category === 'V'
      ) {
        //console.log('Found function application:', C.text, D.text, B.text);
        const newText = `${C.text}(${D.text}, ${B.text})`;
        stack.splice(size - 4, 4, 
          { category: 'V', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABC &&
        belong(A.category, 
          ['M', 'V', 'F', '(', '←', 'Edge', ':']) &&
        belong(B.category, ['F', 'V']) &&
        C.category === 'M'
      ) {
        //console.log('Found monadic operator:', B.text, C.text);
        const newText = `(${C.text}(${B.text}))`;
        stack.splice(size - 3, 3, 
          { category: 'F', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        (((belong(A.category, 
          ['M', 'F', '(', '←', 'Edge', ':']) &&
        (B.category ===  'V')) )||
        ((belong(A.category, 
          ['M', 'V', 'F', '(', '←', 'Edge', ':']) &&
        (B.category === 'F')) ))
        &&
        C.category === 'D' &&
        belong(D.category, ['F', 'V'])
      ) {
        //console.log('Found dyadic operator:', B.text, C.text, D.text);
        const newText = `(${C.text}(${B.text}, ${D.text}))`;
        stack.splice(size - 4, 4, 
          { category: 'F', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        belong(A.category, 
          ['M', 'V', 'F', '(', '←', 'Edge', ':']) &&
        belong(B.category, ['F', 'V']) &&
        C.category === 'F' &&
        D.category === 'F'
      ) {
        //console.log('Found train with functions:', B.text, C.text, D.text);
        let newText = '';
        if(B.category === 'V') {
          newText = `((${_w_}, ${_a_})=> ${C.text}(${D.text}, ${B.text}(${_w_}, ${_a_})))`;
        } else {
          newText = `((${_w_}, ${_a_})=> ${C.text}(${D.text}(${_w_}, ${_a_}), ${B.text}(${_w_}, ${_a_})))`;     
        }
        stack.splice(size - 4, 4, 
          { category: 'F', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABC &&
        belong(A.category, 
          ['(', '←', 'Edge', ':']) &&
        B.category === 'F' &&
        C.category === 'F'
      ) {
        //console.log('Found train:', B.text, C.text);
        const newText = `((${_w_}, ${_a_})=> ${B.text}(${C.text}(${_w_}, ${_a_})))`;
        stack.splice(size - 3, 3, 
          { category: 'F', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        belong(A.category, 
          ['(', '←', 'M', 'F', 'Edge']) &&
        B.category === 'V' &&
        C.category === '←' &&
        belong(D.category, ['F', 'V', 'M', 'D'])
      ) {
        //console.log('Found assignment:', B.text, D.text);
        const [categoryEntry, global] 
          = find_category(B.text, scope);
        let newText = '';
        const Btext = global ? B.text.slice(2) : B.text;
        if(Btext === '_a_' && categoryEntry && categoryEntry.name === '') { // First assignment of ⍺ in a DFN
          newText = `${B.text} = _a_===undefined ? ${D.text} : _a_`;
        } else newText = `${B.text} = ${D.text}`;
        scope[scope.length - 1][Btext] = 
          { category: D.category, name: Btext }; 
        stack.splice(size - 4, 4, 
          { category: D.category, text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        A.category === 'Edge' &&
        B.category === 'V' &&
        C.category === ':' &&
        D.category === 'V'
      ) {
        //console.log('Found conditional:', B.text, D.text);
        let newText = `if(${B.text}===1) return ${D.text}`;
        stack.splice(size - 4, 4, 
          { category: 'V', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(AB &&
        A.text === 'G.outer' &&
        B.category === 'F'
      ) {
        //console.log('Found outer:', B.text);
        stack.splice(size - 2, 2, A, B);
        foundReduction = true;
        continue;
      }
    }
  }
  const processDFN = (subExpressions, scope) => {
    const subScope = {
      '_del_': { category: 'F', name: '_del_' },
      '_ddel_': { category: 'D', name: '_ddel_' },
      '_a_': { category: 'V', name: '' }, // name is empty to deal with first assignment of ⍺ in a DFN
    };  
    scope.push(subScope);
    let resultText = '';
    for (let i = 0; i < subExpressions.length; i++) {
      const subExpression = subExpressions[i];
      const subResult = parseExpression(subExpression, scope);
      if (i === subExpressions.length - 1) {
        resultText += `return ${subResult};`;
      } else {
        resultText += `${subResult}; `;
      }
    }
    delete scope[scope.length - 1]['_del_'];
    delete scope[scope.length - 1]['_ddel_'];
    delete scope[scope.length - 1]['_a_'];
    let prefix = 'let ';
    let first = true;
    for(const key in subScope) {
      if (!first) {
        prefix += ', ';
      } else {
        first = false;
      }
      prefix += key;
      if(key[0] === '[') prefix += ' = []';
    }
    if (!first) {
      resultText = `${prefix}; ${resultText}`;
    }
    scope.pop();
    return resultText;
  }
  const tokens = expression.reverse();
  tokens.push({ type: 'Edge', value: 'Edge' });
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const reg = {};
    if (token.type === 'DFN') {
      reg.category = 'F';
      const newText = processDFN(token.value, scope);
      reg.text = `(function _del_(${_w_}, ${_a_}) {${newText}})`;
    } else if (token.type === 'DOPD') {
      reg.category = 'D';
      const newText = processDFN(token.value, scope);
      reg.text = `(function _ddel_(${_aa_}, ${_ww_}) { return (function _del_(${_w_}, ${_a_}) {${newText}})})`;
    } else if (token.type === 'DOPM') {
      reg.category = 'M';
      const newText = processDFN(token.value, scope);
      reg.text = `(function _ddel_(${_aa_}) { return (function _del_(${_w_}, ${_a_}) {${newText}})})`;
    } else if (token.type === 'SPECIAL_VAR') {
      reg.category = global_category[token.value].category;
      reg.text = global_category[token.value].name;
    } else if (
        token.type === 'IDENTIFIER' ||
        token.type === 'SYMBOL'
      ) {
      const [cat_name, global] = find_category(token.value, scope);
      reg.category = cat_name ? cat_name.category : 'V';
      reg.text = (global ? 'G.' : '') + (cat_name && cat_name.name ? cat_name.name : token.value);
    } else {
      reg.category = 
        token.type === 'NUMBER' ? 'V' : 
        token.type === 'STRING' ? 'V' : token.value;
      if (token.type === 'NUMBER') {
        reg.text = token.value.replace('¯', '-');
      } else reg.text = token.value;
    }
    stack.push(reg);
    // Apply reduction rules greedily onto the stack frame
    /*if(reg.category !=='V')*/ reduceStack();
  }
  // Post-parsing structural check
  if (stack.length > 2) {
    console.log("❌ SYNTAX ERROR: The stack ended with orphaned elements!:", stack.slice(1).map(e => e.text).join(', '));
  }
  return stack[0].text;
}

const parser = (text) => {
  const tokens = tokenizer(text);
  const [expressions, _] = breakExpressions(tokens, 0);
  const scope = [{...global_category}];
  let finalResult = '';
  for (let i = 0; i < expressions.length; i++) {
    const expression = expressions[i];
    const result = parseExpression(expression, scope);
    if (i === expressions.length - 1) {
      finalResult += `return ${result};`;
    } else {
      finalResult += `${result}; `;
    }
  }
  return finalResult;
}

const aplToJavaScript = (text) => {
  return parser(text);
};

const evaluateApl = (text, runtime = G) => {
  const generatedCode = aplToJavaScript(text);
  const executor = new Function('G', generatedCode);
  return executor(Object.create(runtime));
};

const AplJS = () => {
  const context = Object.create(G);
  return (text) => {
    const generatedCode = aplToJavaScript(text);
    const executor = new Function('G', generatedCode);
    return executor(context);
  };
}

export {
  tokenizer,
  breakExpressions,
  parseExpression,
  parser,
  aplToJavaScript,
  evaluateApl,
  G,
  global_category,
  AplJS
};