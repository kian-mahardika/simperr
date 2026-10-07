const fs=require('fs'),vm=require('vm');const assert=require('assert');
const root=require('path').resolve(__dirname,'..');
const nodes=new Map();function node(key){if(!nodes.has(key))nodes.set(key,{hidden:false,innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},addEventListener(){},remove(){},setAttribute(){},focus(){}});return nodes.get(key)}
const context={document:{querySelector:node,addEventListener(){}},window:{scrollTo(){}},localStorage:{getItem(){return null},setItem(){}},sessionStorage:{getItem(){return null},setItem(){},removeItem(){}},crypto:globalThis.crypto,Date,Intl,Number,String,Array,Math,JSON,setTimeout,clearTimeout,console};vm.createContext(context);
const data=fs.readFileSync(root+'/catalog-data.js','utf8').replace('export const','const');const src=fs.readFileSync(root+'/src.js','utf8').replace(/^import .*$/gm,'');vm.runInContext(data+'\nconst SUPABASE_CONFIG={url:"",publishableKey:""};\n'+src,context);
const result=vm.runInContext(`(()=>{
 const unique=new Set(state.books.map(x=>x.title));
 role='MEMBER';session=state.accounts.find(x=>x.memberId==='M001');currentMember='M001';
 requestBook('B0020');const l=state.loans[0];
 role='LIBRARIAN';session=state.accounts.find(x=>x.role==='LIBRARIAN');
 confirmLoan(l.id,localDate());const reserved=l.status==='READY_PICKUP'&&l.dueDate===null&&findBook(l.bookId).copies.some(x=>x.status==='RESERVED');
 const wrong=handoverLoan(l.id,'0000000000');const noHandover=l.status==='READY_PICKUP';
 handoverLoan(l.id,'4199990001');const due=l.dueDate;const start=l.loanDate;
 l.dueDate=offsetDate(-2);returnLoan(l.id,'4199990001','BAIK','RETURNED');
 const lateCase=state.cases.find(c=>c.loanId===l.id);
 requestBook('B0023');const missing=state.loans[0];confirmLoan(missing.id,localDate());handoverLoan(missing.id,'4199990001');returnLoan(missing.id,'4199990001','BAIK','LOST');const lostCase=state.cases.find(c=>c.loanId===missing.id);
 return {books:state.books.length,unique:unique.size,reserved,wrong,noHandover,start,due,loanStatus:l.status,fee:lateCase.amount,kind:lateCase.type,caseStatus:lateCase.status,lostAmount:lostCase.amount,lostStatus:missing.status,rooms:roomNames.length};
})()`,context);
assert.equal(result.books,538);assert.equal(result.unique,538);assert(result.reserved);assert.equal(result.wrong,false);assert(result.noHandover);assert.equal(result.loanStatus,'LATE_RETURNED');assert.equal(result.fee,2000);assert.equal(result.kind,'LATE');assert.equal(result.rooms,10);assert.equal(result.lostStatus,'LOST');assert(result.lostAmount>0);console.log(result);
