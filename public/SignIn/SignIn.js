document.getElementById('loginForm').addEventListener('submit', function(e) {

  const btn = document.getElementById('submitBtn');
  const originalText = btn.innerText;

  // Simple validation feedback
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (!user || !pass) {
    this.classList.add('shake');
    setTimeout(() => this.classList.remove('shake'), 400);
    return;
  }

  // Mock loading state
  btn.innerText = 'Signing in...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    // Success message box (as per instructions, no alerts)
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #10B981;
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      z-index: 1000;
      font-weight: 600;
      animation: slideUp 0.3s ease-out;
    `;
    successMsg.innerText = 'Successfully signed in! Redirecting...';
    document.body.appendChild(successMsg);

    setTimeout(() => {
      successMsg.style.opacity = '0';
      successMsg.style.transition = 'opacity 0.5s ease';
      setTimeout(() => successMsg.remove(), 500);
      btn.innerText = originalText;
      btn.style.opacity = '1';
      btn.disabled = false;
    }, 2000);
  }, 1500);
});

// Add focus effect visual logic
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
  input.addEventListener('focus', () => {
    const label = input.parentElement.querySelector('label');
    if (label) label.style.color = 'var(--primary-orange)';
  });
  input.addEventListener('blur', () => {
    const label = input.parentElement.querySelector('label');
    if (label) label.style.color = 'inherit';
  });
});