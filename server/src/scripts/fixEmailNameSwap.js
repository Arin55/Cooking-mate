import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

function looksLikeEmail(v){
  return typeof v === 'string' && /.+@.+\..+/.test(v);
}

async function run(){
  await connectDB();
  const users = await User.find({});
  let fixed = 0;
  for (const u of users){
    const emailLooksWrong = !looksLikeEmail(u.email);
    const nameLooksEmail = looksLikeEmail(u.name);
    if (emailLooksWrong && nameLooksEmail){
      const oldEmail = u.email;
      const oldName = u.name;
      u.email = oldName;
      u.name = oldEmail || '';
      try{
        await u.save();
        fixed++;
        console.log(`Fixed user ${u._id}: email<-${oldName}, name<-${oldEmail}`);
      } catch(err){
        console.error(`Failed to fix user ${u._id}:`, err.message);
      }
    }
  }
  console.log(`Done. Fixed ${fixed} user(s).`);
  process.exit(0);
}

run().catch((e)=>{ console.error(e); process.exit(1); });
