
const tokenizer = (text) => {
  const tokens = [];
  const specs = [
    { regex: /^([\r?\n]|⋄)+/u, type: 'SEPARATOR' },
    { regex: /^⍝[^\n]*/u, type: 'COMMENT' },
    { regex: /^(⍺{1,2}|⍵{1,2}|∇{1,2}|[⍶⍹⍙])/u, type: 'SPECIAL_VAR' },
    { regex: /^\s+/, type: 'WHITESPACE' },
    { regex: /^[¯]?\d+(\.\d+)?/u, type: 'NUMBER' },
    { regex: /^'[^'\\]*(?:\\.[^'\\]*)*'/, type: 'STRING' },
    { regex: /^\(/, type: 'PAREN_OPEN' },
    { regex: /^\)/, type: 'PAREN_CLOSE' },
    { regex: /^\{/, type: 'BRACE_OPEN' },
    { regex: /^\}/, type: 'BRACE_CLOSE' },
    { regex: /^←/u, type: 'ASSIGN' },
    { regex: /^:/, type: 'GUARD' },
    { regex: /^∘\./u, type: 'SYMBOL' },
    { regex: /^[,-\/\p{Math}\p{Sm}\p{So}]/u, type: 'SYMBOL' },
    { regex: /^[\p{L}_][\p{L}0-9_]*/u, type: 'IDENTIFIER' }
  ];
    
  let cursor = 0;

  while (cursor < text.length) {
    let matched = false;
    for (const spec of specs) {
      const match = text.slice(cursor).match(spec.regex);
      if (match) {
        if (spec.type !== 'WHITESPACE' && spec.type !== 'COMMENT') {
          tokens.push({ type: spec.type, value: match[0] });
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
  '/': { category:'M', name: 'reduce' },
  '\\': { category:'M', name: 'scan' },
  '⍨': { category:'M', name: 'commute' },
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
  '∘.': { category:'M', name: 'outer' },
}

const _a_ = global_category['⍺'].name;
const _w_ = global_category['⍵'].name;
const _aa_ = global_category['⍺⍺'].name;
const _ww_ = global_category['⍵⍵'].name;

const G = {
  set quad(value) {
    console.log('⎕:', value);
  },
  right: (w) => w,
  left: (w,a) => (a===undefined?w:a),
  rho: function(w, a) {
    if (a===undefined) {
      //shape of w
      const rec = (arr) => {
        if(!Array.isArray(arr)) {
          return [];
        }
        const shape = rec(arr[0]);
        shape.splice(0,0,arr.length);
        return shape;      
      }
      return rec(w);
    }
    const m = w.length;
    let index = 0;
    const fillShape = (shape) => {
      if (shape.length === 1) {
        let result = [];
        for (let i = 0; i < shape[0]; i++) {
          result.push(w[index % m]);
          index++;
        }
        return result;
      }
      let result = [];
      for (let i = 0; i < shape[0]; i++) {
        const subArray = fillShape(shape.slice(1));
        result.push(subArray);
      }
      return result;
    };
    return fillShape(a);
  },
  tally: (w) => {
    if (Array.isArray(w)||typeof w === 'string') {
      return w.length;
    } else {
      throw new Error('Unsupported type for tally');
    }
  },
  outer: (f)=>(w, a) => {
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
  equals: (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a === b;
    } else {
      throw new Error('Unsupported types for comparison');
    }
  },
  residue: (w, a) => {
    if (typeof w === 'number' && typeof a === 'number') {
      return w % a;
    } else {
      throw new Error('Unsupported types for residue');
    }
  },
  divide: (w, a) => {
    if (typeof w === 'number' && typeof a === 'number') {
      return a / w;
    } else {
      throw new Error('Unsupported types for division');
    }
  },
  plus: (w, a) => {
    if(typeof w === 'number' && a === undefined) {
      return w;
    }
    if(Array.isArray(w) && a === undefined) {
      return w.map(x => Math.abs(x));
    }
    if (typeof w === 'number' && typeof a === 'number') {
      return w + a;
    } else if (Array.isArray(a) && typeof w === 'number') {
      return a.map(x => x + w);
    } else if (typeof a === 'number' && Array.isArray(w)) {
      return w.map(x => a + x);
    } else if (Array.isArray(a) && Array.isArray(w)) {
      if (a.length !== w.length) {
        throw new Error('Arrays must be of the same length for element-wise addition.');
      }
      return a.map((x, i) => x + w[i]);
    } else {
      throw new Error('Unsupported types for addition');
    }
  },
  minus: (b, a) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else if (Array.isArray(a) && typeof b === 'number') {
      return a.map(x => x - b);
    } else if (typeof a === 'number' && Array.isArray(b)) {
      return b.map(x => a - x);
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        throw new Error('Arrays must be of the same length for element-wise subtraction.');
      }
      return a.map((x, i) => x - b[i]);
    } else {
      throw new Error('Unsupported types for subtraction');
    }
  },
  times: (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a * b;
    } else if (Array.isArray(a) && typeof b === 'number') {
      return a.map(x => x * b);
    } else if (typeof a === 'number' && Array.isArray(b)) {
      return b.map(x => a * x);
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        throw new Error('Arrays must be of the same length for element-wise multiplication.');
      }
      return a.map((x, i) => x * b[i]);
    } else {
      throw new Error('Unsupported types for multiplication');
    }
  },
  iota: (n) => {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('Iota requires a non-negative integer');
    }
    return Array.from({ length: n }, (_, i) => i);
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
      if (ABC && 
        A.category === '(' && 
        belong(B.category, ['V','F','D', 'M']) &&
        C.category === ')'
      ) {
        stack.splice(size - 3, 3, { category: B.category, text: B.text });
        foundReduction = true;
        continue;
      }
      if (AB && 
        A.category === 'V' && 
        B.category === 'V'
      ) {
        let newText = '';
        const A_brackets = countInitialBrackets(A.text);
        const B_brackets = countInitialBrackets(B.text);
        if(B_brackets > A_brackets) {
          newText = `[${A.text}, ${B.text.slice(1)}`;
        } else {
          newText = `[${A.text}, ${B.text}]`;
        }
        stack.splice(size - 2, 2, 
            { category: 'V', text: newText });          
        foundReduction = true;
        continue;
      }
      if(ABC &&
        belong(A.category, ['F', '(', '←', 'Edge', ':']) &&
        B.category === 'F' &&
        C.category === 'V'
      ) {
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
        const newText = `${C.text}(${D.text})`;
        stack.splice(size - 4, 4, 
          { category: 'V', text: newText }, B, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        belong(A.category, ['M', 'V', 'F', '(', '←', 'Edge', ':']) &&
        B.category === 'V' &&
        C.category === 'F' &&
        D.category === 'V'
      ) {
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
        const newText = `(${C.text}(${B.text}))`;
        stack.splice(size - 3, 3, 
          { category: 'F', text: newText }, A);
        foundReduction = true;
        continue;
      }
      if(ABCD &&
        belong(A.category, 
          ['M', 'V', 'F', '(', '←', 'Edge', ':']) &&
        belong(B.category, ['F', 'V']) &&
        C.category === 'D' &&
        belong(D.category, ['F', 'V'])
      ) {
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
        let newText = '';
        if(B.category === 'V') {
          newText = `((${_w_}, ${_a_})=> ${C.text}(${B.text}, ${D.text}(${_w_}, ${_a_})))`;
        } else {
          newText = `((${_w_}, ${_a_})=> ${C.text}(${B.text}(${_w_}, ${_a_}), ${D.text}(${_w_}, ${_a_})))`;     
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
        let newText = `if(${B.text}) return ${D.text}`;
        stack.splice(size - 4, 4, 
          { category: 'V', text: newText }, A);
        foundReduction = true;
        continue;
      }
            if(AB &&
        A.text === 'G.outer' &&
        B.category === 'F'
      ) {
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
    reduceStack();
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

export {
  tokenizer,
  breakExpressions,
  parseExpression,
  parser,
  aplToJavaScript,
  evaluateApl,
  G,
  global_category,
};