// Redirect if already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/';
}

function togglePass(id) {
  const input = document.getElementById(id);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}