const fs=require('node:fs'),path=require('node:path');
const {load}=require('./load-typescript.cjs');
const {curriculumLibrary}=load('src/lib/curriculum/index.ts');
const {expandedLibrary}=load('src/lib/curriculum/expanded.ts');
const out=path.resolve('public/erklaerbilder');fs.mkdirSync(out,{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function lines(s,width){const result=[];let line='';for(const word of s.split(/\s+/)){if((line+' '+word).length>width&&line){result.push(line);line=word}else line+=(line?' ':'')+word}if(line)result.push(line);return result}
function text(s,x,y,width,size=20,color='#17364b'){return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}">${lines(s,width).map((l,i)=>`<tspan x="${x}" dy="${i?size*1.4:0}">${esc(l)}</tspan>`).join('')}</text>`}
for(const quiz of curriculumLibrary.quizzes)for(const q of quiz.questions){
 const correct=q.answers.find(a=>a.isCorrect).text,wrong=q.answers.filter(a=>!a.isCorrect).map(a=>a.text);
 const qh=lines(q.text,66).length*29, ah=lines(correct,65).length*29, context=q.explanation.replace(correct+'. ',''),ch=lines(context,84).length*23;
 const ay=100+qh,cy=ay+ah+85,wy=cy+ch+70,height=wy+Math.max(...wrong.map(w=>lines(w,34).length))*23+100;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(q.text)}</title><desc id="desc">${esc(correct+'. '+q.explanation)}</desc><rect width="1000" height="${height}" rx="24" fill="#f1f7fa"/><rect width="1000" height="12" fill="#087f8c"/>${text('VERSTEHEN · EINORDNEN · ABGRENZEN',40,49,90,15,'#087f8c')}${text(q.text,40,88,66,22)}<path d="M500 ${ay-15}v28" stroke="#087f8c" stroke-width="3"/><path d="M494 ${ay+4}l6 9 6-9" fill="none" stroke="#087f8c" stroke-width="3"/><rect x="30" y="${ay+20}" width="940" height="${ah+36}" rx="15" fill="#d9f3e9"/>${text('✓ '+correct,50,ay+52,65,22,'#155540')}${text(context,40,cy,84,17)}<path d="M500 ${wy-45}v18H260v18 M500 ${wy-27}h240v18" fill="none" stroke="#9baebb" stroke-width="2"/>${wrong.map((w,i)=>`<rect x="${30+i*480}" y="${wy-8}" width="460" height="${height-wy-30}" rx="13" fill="#fff1ef"/>${text('NICHT DIE RICHTIGE ANTWORT',50+i*480,wy+17,40,12,'#9b4339')}${text(w,50+i*480,wy+48,34,16,'#743c36')}`).join('')}<text x="40" y="${height-15}" font-family="Arial,sans-serif" font-size="11" fill="#526b78">Eigenes didaktisches Schema · fachliche Quelle bei der Lernfrage · keine Einsatzanweisung</text></svg>`;
 fs.writeFileSync(path.resolve('public'+q.explanationImageUrl),svg);
}
console.log('Erklärgrafiken:',fs.readdirSync(out).length);
