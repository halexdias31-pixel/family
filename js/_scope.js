const acorn=require('acorn');

// Collect names bound by a pattern
function pat(node, out){
  if(!node) return;
  switch(node.type){
    case 'Identifier': out.push(node.name); break;
    case 'ObjectPattern': node.properties.forEach(p=>pat(p.type==='RestElement'?p.argument:p.value,out)); break;
    case 'ArrayPattern': node.elements.forEach(e=>pat(e,out)); break;
    case 'AssignmentPattern': pat(node.left,out); break;
    case 'RestElement': pat(node.argument,out); break;
  }
}

const FN=new Set(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression']);

// Walk producing free identifiers, given a set of names considered "already bound" (outer)
function freeVars(nodes){
  const free=new Set();
  const scopes=[new Set()];
  const bound=n=>scopes.some(s=>s.has(n));
  const declare=n=>scopes[scopes.length-1].add(n);

  // hoist var+function decls into a scope
  function hoist(body,scope){
    const stack=[...body];
    while(stack.length){
      const n=stack.pop();
      if(!n||typeof n.type!=='string') continue;
      if(n.type==='FunctionDeclaration'&&n.id) scope.add(n.id.name);
      if(n.type==='ClassDeclaration'&&n.id) scope.add(n.id.name);
      if(n.type==='VariableDeclaration'){ const a=[]; n.declarations.forEach(d=>pat(d.id,a)); a.forEach(x=>scope.add(x)); }
      if(FN.has(n.type)) continue; // don't descend into nested functions for var hoisting of outer
      for(const k in n){
        if(k==='type'||k==='start'||k==='end'||k==='loc') continue;
        const v=n[k];
        if(Array.isArray(v)) v.forEach(x=>x&&typeof x.type==='string'&&stack.push(x));
        else if(v&&typeof v.type==='string') stack.push(v);
      }
    }
  }

  function walk(n,parent,key){
    if(!n||typeof n.type!=='string') return;
    if(FN.has(n.type)){
      const s=new Set();
      if(n.type==='FunctionExpression'&&n.id) s.add(n.id.name);
      n.params.forEach(p=>{const a=[];pat(p,a);a.forEach(x=>s.add(x));});
      s.add('arguments');
      if(n.body.type==='BlockStatement') hoist(n.body.body,s);
      scopes.push(s);
      n.params.forEach(p=>walk(p,n,'params'));
      walk(n.body,n,'body');
      scopes.pop();
      return;
    }
    if(n.type==='BlockStatement'||n.type==='Program'){
      const s=new Set(); hoist(n.body,s); scopes.push(s);
      n.body.forEach(c=>walk(c,n,'body')); scopes.pop(); return;
    }
    if(n.type==='CatchClause'){
      const s=new Set(); if(n.param){const a=[];pat(n.param,a);a.forEach(x=>s.add(x));}
      scopes.push(s); walk(n.body,n,'body'); scopes.pop(); return;
    }
    if(n.type==='ForStatement'||n.type==='ForInStatement'||n.type==='ForOfStatement'){
      const s=new Set();
      const init=n.init||n.left;
      if(init&&init.type==='VariableDeclaration'){const a=[];init.declarations.forEach(d=>pat(d.id,a));a.forEach(x=>s.add(x));}
      scopes.push(s);
      for(const k of ['init','left','test','update','right','body']) if(n[k]) walk(n[k],n,k);
      scopes.pop(); return;
    }
    if(n.type==='Identifier'){
      // skip non-reference positions
      if(parent){
        if(parent.type==='MemberExpression'&&key==='property'&&!parent.computed) return;
        if(parent.type==='Property'&&key==='key'&&!parent.computed) return;
        if(parent.type==='MethodDefinition'&&key==='key'&&!parent.computed) return;
        if((parent.type==='LabeledStatement'||parent.type==='BreakStatement'||parent.type==='ContinueStatement')&&key==='label') return;
      }
      if(!bound(n.name)) free.add(n.name);
      return;
    }
    for(const k in n){
      if(k==='type'||k==='start'||k==='end'||k==='loc') continue;
      const v=n[k];
      if(Array.isArray(v)) v.forEach(x=>x&&typeof x.type==='string'&&walk(x,n,k));
      else if(v&&typeof v.type==='string') walk(v,n,k);
    }
  }

  const s=new Set(); hoist(nodes,s); scopes[0]=s;
  nodes.forEach(n=>walk(n,null,null));
  return {free,declared:s};
}
module.exports={freeVars,pat};

/* FREE NAMES THAT ACTUALLY EVALUATE NOW — the same walk, except it does not go inside a function
   or an arrow body. A name mentioned inside `const f = () => USER.name` is not read until f is
   called; a name in `const n = USER.name` is read this instant. Only the second can be in a
   temporal dead zone, and treating them alike reported twelve faults that were not there. */
function eagerFree(nodes){
  const out=new Set();
  const bound=[new Set()];
  function walk(n,parent,key){
    if(!n||typeof n.type!=='string') return;
    if(FN.has(n.type)) return;                       // not evaluated now
    if(n.type==='Identifier'){
      if(parent){
        if(parent.type==='MemberExpression'&&key==='property'&&!parent.computed) return;
        if(parent.type==='Property'&&key==='key'&&!parent.computed) return;
        if(parent.type==='VariableDeclarator'&&key==='id') return;
        if((parent.type==='LabeledStatement'||parent.type==='BreakStatement'||parent.type==='ContinueStatement')&&key==='label') return;
      }
      out.add(n.name); return;
    }
    for(const k in n){
      if(k==='type'||k==='start'||k==='end'||k==='loc') continue;
      const v=n[k];
      if(Array.isArray(v)) v.forEach(x=>x&&typeof x.type==='string'&&walk(x,n,k));
      else if(v&&typeof v.type==='string') walk(v,n,k);
    }
  }
  nodes.forEach(n=>walk(n,null,null));
  return out;
}
module.exports.eagerFree=eagerFree;
