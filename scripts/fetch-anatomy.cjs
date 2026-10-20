const fs = require('node:fs');
(async () => {
  fs.mkdirSync('public/anatomie', { recursive: true });
  for (const [page, name] of [['Gehirn_beschriftet.svg', 'gehirn.svg'], ['Skelett_des_Menschen_MK1888.png', 'skelett.png'], ['Anatomie_des_Herzens.webm', 'herz.webm']]) {
    const html = await (await fetch('https://commons.wikimedia.org/wiki/File:' + page)).text();
    const url = html.match(/class="fullMedia"[\s\S]*?href="([^"]+)/)?.[1];
    if (!url) throw Error(page);
    const response = await fetch(url);
    if (!response.ok) throw Error(response.status);
    fs.writeFileSync('public/anatomie/' + name, Buffer.from(await response.arrayBuffer()));
    console.log(name, fs.statSync('public/anatomie/' + name).size);
  }
})().catch(error => { console.error(error); process.exit(1); });
