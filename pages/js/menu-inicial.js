import { storage } from '../../assets/js/db.js';

const sessionId = storage.get('ap_sess');
const db = storage.get('ap_db') || { users: [], plants: [] };

if (sessionId && db.users.some(user => user.id === sessionId)) {
  window.location.replace('index.html');
}
