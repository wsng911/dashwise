import PocketBase from 'pocketbase';
import config from './config';

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090');

// Load auth store from cookies (for SSR)
export function getServerPB(cookieHeader?: string) {
  const serverPB = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090');
  if (cookieHeader) {
    serverPB.authStore.loadFromCookie(cookieHeader);
  }
  return serverPB;
}


export async function getSuperuserPB() {
    const pb = new PocketBase(config.pb_url);
    await pb.collection('_superusers').authWith密码(config.pbAdmin邮箱, config.pbAdmin密码);
    return pb;
}


export default pb;
