const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {spawn, spawnSync} = require('node:child_process');
const net = require('node:net');
const root = path.resolve(__dirname, '..');
process.chdir(root);
function run(command, args, capture = false) {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit'});
  if (result.error || result.status !== 0) throw new Error(`${command} fehlgeschlagen. Bitte die Ausgabe oben prüfen.`);
  return (result.stdout || '').trim();
}
function portInUse() {
  return new Promise(resolve => {
    const socket = net.connect({host:'127.0.0.1', port:3000});
    socket.once('connect', () => {socket.destroy(); resolve(true)});
    socket.once('error', () => {socket.destroy(); resolve(false)});
  });
}
async function main() {
  if (process.env.CODESPACES !== 'true') throw new Error('Dieser automatische Start ist ausschließlich für GitHub Codespaces vorgesehen. Lokal: npm run dev');
  if (await portInUse()) {console.log('Port 3000 ist bereits aktiv. Vorschau im Reiter Ports öffnen.'); return;}
  const startupSource = fs.readFileSync(__filename, 'utf8');
  // Never overwrite edits or switch a user's branch while refreshing the preview.
  if (!run('git',['status','--porcelain'],true) && run('git',['branch','--show-current'],true)==='main') {
    run('git',['pull','--ff-only','origin','main']);
    // Continue in the updated script, not the version loaded before git pull.
    if (fs.readFileSync(__filename, 'utf8') !== startupSource) {
      run(process.execPath, [__filename]);
      return;
    }
  } else {
    console.log('Eigene Änderungen oder anderer Branch: kein automatisches Git-Update.');
  }
  fs.mkdirSync('.data',{recursive:true});
  const stamp = '.data/codespaces-dependencies';
  const fingerprint = createHash('sha256').update(fs.readFileSync('package-lock.json')).update(process.version + process.platform + process.arch).digest('hex');
  if (!fs.existsSync('node_modules/next') || !fs.existsSync(stamp) || fs.readFileSync(stamp,'utf8') !== fingerprint) {
    run('npm',['ci','--no-audit','--no-fund']);
    fs.writeFileSync(stamp, fingerprint);
  }
  console.log('Rettungsapp wird für die stabile Vorschau gebaut. Bitte warten …');
  run('npm',['run','build']);
  const log = fs.openSync('.data/codespaces-server.log','a');
  const child = spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','0.0.0.0','--port','3000'], {
    cwd:root, detached:true, stdio:['ignore',log,log], env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',NODE_ENV:'production'}
  });
  child.on('error', error => {console.error(error.message); process.exitCode=1;});
  child.unref(); fs.closeSync(log);
  for (let attempt=0; attempt<60; attempt++) {
    try {
      const response=await fetch('http://127.0.0.1:3000/api/session',{signal:AbortSignal.timeout(3000)});
      if (response.ok) {
        console.log('Rettungsapp bereit (stabiler App-Server, ohne Live-Neuladen): http://localhost:3000 – im Reiter Ports auf „Im Browser öffnen“ klicken.');
        console.log('Admin-Zugang: private Datei .data/ERSTER-ADMIN.txt. Keine Zugangsdaten ins Repository kopieren.');
        return;
      }
    } catch {}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  throw new Error('Start noch nicht erfolgreich. Details: .data/codespaces-server.log');
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
