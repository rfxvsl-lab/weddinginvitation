import {createClient} from '@libsql/client';
import {readFileSync} from 'node:fs';
const c=createClient({url:'file:./local.db'});
(async()=>{
for (const s of readFileSync('migrations/006_add_guest_confirmation.sql','utf8').split(';').map(x=>x.trim()).filter(Boolean)) { try{await c.execute(s)}catch(e){console.log('skip',String(e).slice(0,60))} }
await c.execute({sql:"UPDATE guests SET seat_image_url=? WHERE invitation_code='W-ANDIW'",args:['https://res.cloudinary.com/dxklmdbjv/image/upload/v1794208014/wedding/moments/jnpjoajhsxdnia2n8tiq.jpg']});
console.log('ok');
})();
