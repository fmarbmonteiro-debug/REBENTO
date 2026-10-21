import { storage } from './db.js';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

async function hash(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('A autenticação requer um contexto seguro (HTTPS ou localhost).');
  }

  const data = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function ensureDemoAccount() {
  const db = storage.get('ap_db') || { users: [], plants: [] };
  const email = 'teste@rebento.local';

  if (db.users.some(user => user.email === email)) {
    return;
  }

  db.users.push({
    id: 'rebento-demo-user',
    name: 'Utilizador Teste',
    email,
    salt: 'rebento-demo-salt-2026',
    hash: 'ad686c9c72647e1f58bb65a4cb6b3f69b566cbc0d7f74b2742296b73782dabb5',
    avatar: '🧑‍🌾',
    created: today()
  });
  storage.set('ap_db', db);
}

export async function register(name, email, password) {
  const db = storage.get('ap_db') || { users: [], plants: [] };
  const normalizedEmail = email.trim().toLowerCase();

  if (password.length < 6) {
    throw new Error('A palavra-passe precisa de pelo menos 6 caracteres.');
  }

  if (db.users.some(user => user.email === normalizedEmail)) {
    throw new Error('Já existe uma conta com este email.');
  }

  const salt = uid();
  const user = {
    id: uid(),
    name: name.trim(),
    email: normalizedEmail,
    salt,
    hash: await hash(password, salt),
    avatar: '🧑‍🌾',
    created: today()
  };

  db.users.push(user);
  storage.set('ap_db', db);
  storage.set('ap_sess', user.id);
}

export async function login(email, password) {
  const db = storage.get('ap_db') || { users: [], plants: [] };
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(candidate => candidate.email === normalizedEmail);

  if (!user || user.hash !== await hash(password, user.salt)) {
    throw new Error('Email ou palavra-passe incorretos.');
  }

  storage.set('ap_sess', user.id);
}
