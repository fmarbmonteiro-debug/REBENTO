import { register } from '../../assets/js/auth.js';

const form = document.querySelector('#registo-form');
const errorMessage = document.querySelector('#form-error');

form.addEventListener('submit', async event => {
  event.preventDefault();
  errorMessage.textContent = '';

  try {
    await register(
      document.querySelector('#nome').value,
      document.querySelector('#email').value,
      document.querySelector('#password').value
    );
    window.location.href = 'index.html';
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});
