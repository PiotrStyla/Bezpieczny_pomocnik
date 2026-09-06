import {mkdir,copyFile,readdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PUBLIC_FILES} from './public-files.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dest=resolve(root,'dist');
await mkdir(dest,{recursive:true});
const existing=await readdir(dest,{recursive:true,withFileTypes:true});
for(const file of existing){
  if(!file.isFile())continue;
  const name=relative(dest,resolve(file.parentPath,file.name)).replaceAll('\\','/');
  if(!PUBLIC_FILES.includes(name))throw new Error('Unexpected file in dist; inspect before deploying: '+name);
}
for(const file of PUBLIC_FILES){
  const target=resolve(dest,file);
  await mkdir(dirname(target),{recursive:true});
  await copyFile(resolve(root,'frontend',file),target);
}
console.log('Built '+PUBLIC_FILES.length+' public files in dist. No legacy runtime or development pages included.');
