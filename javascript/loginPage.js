document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();
  const messageElement = document.getElementById('message');
  messageElement.textContent = result.message;

  if (result.message === 'ログイン成功') {
    const correction = document.querySelector('input[name="correction"]:checked');
    const correctionValue = correction ? correction.value : 'なし';

    setTimeout(() => {
      if (correctionValue === 'あり') {
        window.location.href = `syusei.html?username=${encodeURIComponent(username)}`;
      } else {
        window.location.href = `index.html?username=${encodeURIComponent(username)}`;
      }
    }, 1000);
  }
});
// Cookieを設定する関数
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Cookieを取得する関数
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('operationModal');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('closeModalBtn');
  const overlay = document.getElementById('modalOverlay');

  // Cookieで初回表示かどうかを判定
  const hasSeenModal = getCookie('seenModal');

  // Cookieが無い場合のみモーダルを表示
  if (!hasSeenModal && modal && overlay) {
    modal.style.display = 'block';
    overlay.style.display = 'block';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modalBody.scrollTop = 0;

    // モーダルを表示したことを記録（365日間有効）
    setCookie('seenModal', 'true', 365);
  }

  modalBody.addEventListener('scroll', () => {
    const isBottom = modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight - 5;
    if (isBottom) {
      closeBtn.style.display = 'block';
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
  });
});




