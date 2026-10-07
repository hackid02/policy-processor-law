import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const external=process.env.BASE_URL;
const base=external||'http://127.0.0.1:3000';
const server=external?null:spawn(process.execPath,['web/node_modules/next/dist/bin/next','start','web','--hostname','0.0.0.0','-p','3000'],{stdio:'inherit'});
try{
 let ready=false;
 for(let i=0;i<60;i++){
  if(server?.exitCode!==null && server?.exitCode!==undefined)throw new Error('Web server exited before UI tests');
  try{const r=await fetch(base,{signal:AbortSignal.timeout(1500)});if(r.ok){ready=true;break;}}catch{}
  await delay(500);
 }
 if(!ready)throw new Error('Web server did not become ready');
 for(const test of ['browser','restored-ui','courtroom-rpc','toolkit']){
  await new Promise((resolve,reject)=>{
   const p=spawn(process.execPath,[`tests/${test}.mjs`],{stdio:'inherit',env:{...process.env,BASE_URL:base}});
   p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error(`${test}: exit ${code}`)));
  });
}
}finally{server?.kill('SIGTERM');}
