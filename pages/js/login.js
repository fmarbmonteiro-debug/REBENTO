import { ensureDemoAccount, login } from '../../assets/js/auth.js';

const form = document.querySelector('#login-form');
const errorMessage = document.querySelector('#form-error');

try {
  ensureDemoAccount();
} catch (error) {
  errorMessage.textContent = 'Não foi possível preparar a conta de demonstração neste navegador.';
  console.error('Could not create the demo account.', error);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  errorMessage.textContent = '';

  try {
    await login(
      document.querySelector('#email').value,
      document.querySelector('#password').value
    );
    window.location.href = 'index.html';
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});
