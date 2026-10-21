// Own schematics and captioned explanatory clips; requires ffmpeg and sharp.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),sharp=require('sharp');
const {load}=require('./load-typescript.cjs');const {anatomyModels}=load('src/lib/anatomy-data.ts');
const out=path.resolve('public/anatomie/eigen'),tmp=path.resolve('.anatomy-render');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(tmp,{recursive:true});
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function wrap(s,n){const a=[];let l='';for(const w of s.split(/\s+/)){if((l+' '+w).length>n&&l){a.push(l);l=w}else l+=(l?' ':'')+w}if(l)a.push(l);return a}
function text(s,x,y,n,size,color='#17364b'){return `<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" fill="${color}">${wrap(s,n).map((l,i)=>`<tspan x="${x}" dy="${i?size*1.4:0}">${esc(l)}</tspan>`).join('')}</text>`}
function time(s){return `00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.000`}
(async()=>{for(const model of anatomyModels){let vtt='WEBVTT\n\n';for(let i=0;i<model.parts.length;i++){const p=model.parts[i];const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#f0f7fa"/><rect width="1280" height="12" fill="#087f8c"/>${text(model.title,45,65,70,30)}${text('EIGENES LERNSCHEMA · STRUKTUR '+(i+1)+' / '+model.parts.length,45,100,100,15,'#087f8c')}<g transform="translate(20 130)">${model.parts.map((part,j)=>`<path d="${part.path}" fill="${part.color}" fill-opacity="${j===i?1:0.22}" stroke="${j===i?'#075c70':'#97aebc'}" stroke-width="${j===i?4:1}"/>`).join('')}<circle cx="${p.x}" cy="${p.y}" r="14" fill="#075c70"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="15" fill="white">${i+1}</text></g><rect x="550" y="150" width="680" height="490" rx="24" fill="white"/>${text(p.name,580,195,36,27)}${text(p.term,580,250,47,19,'#087f8c')}${text(p.simple,580,300,48,21)}${text('Vereinfachte Darstellung · nicht maßstabsgetreu',45,690,100,15,'#526b78')}<rect x="550" y="655" width="${680*(i+1)/model.parts.length}" height="6" fill="#087f8c"/></svg>`;
 if(i===0)fs.writeFileSync(path.join(out,model.id+'.svg'),svg);
 await sharp(Buffer.from(svg)).png().toFile(path.join(tmp,`${model.id}-${String(i).padStart(2,'0')}.png`));
 vtt+=`${i+1}\n${time(i*8)} --> ${time((i+1)*8)}\n${p.name}: ${p.technical}\n\n`;
 }
 fs.writeFileSync(path.join(out,model.id+'.vtt'),vtt);
 const result=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-framerate','1/8','-i',path.join(tmp,model.id+'-%02d.png'),'-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-vf','fps=24','-movflags','+faststart',path.join(out,model.id+'.mp4')],{stdio:'inherit'});if(result.status!==0)throw Error('ffmpeg: '+model.id);
 console.log(model.id+': '+model.parts.length+' Strukturen, '+(model.parts.length*8)+' Sekunden');
 }fs.rmSync(tmp,{recursive:true,force:true})})().catch(e=>{console.error(e);process.exit(1)});
