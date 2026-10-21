const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'src/lib/curriculum/beta');
const topics=['anatomy','emergency','pharma','tactics','legal','hygiene','communication','pediatrics'];
const output={};
for(const topic of topics){let group;const rows=[];for(const raw of fs.readFileSync(path.join(dir,topic+'.txt'),'utf8').split('\n')){const line=raw.trim();if(!line)continue;
 if(line.startsWith('# ')){const [title,year,source,context]=line.slice(2).split('|');group={title,year:Number(year),source,context};continue}
 const [question,answer,wrongA,wrongB]=line.split('|');if(!group||!question||!answer||!wrongA||!wrongB||new Set([answer,wrongA,wrongB]).size!==3)throw Error(topic+': '+line);
 const source=topic==='legal'&&question.includes('Notstand')?'https://www.gesetze-im-internet.de/stgb/__34.html':group.source;
 rows.push({...group,source,id:topic+'-'+String(rows.length+1).padStart(3,'0'),question,answer,wrong:[wrongA,wrongB]});
 }if(rows.length<100)throw Error(topic+': weniger als 100');output[topic]=rows}
fs.writeFileSync(path.join(dir,'generated.json'),JSON.stringify(output,null,2)+'\n');
console.log(Object.entries(output).map(([name,rows])=>name+': '+rows.length).join('\n'));
