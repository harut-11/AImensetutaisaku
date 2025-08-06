document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();
    document.getElementById('message').textContent = result.message;
  } catch (error) {
    document.getElementById('message').textContent = 'エラーが発生しました。';
    console.error('登録エラー:', error);
  }
});
