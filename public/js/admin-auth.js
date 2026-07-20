export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Login failed');
  }

  window.location.href = '/admin/dashboard.html';
}

export async function logout() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Logout error:', err);
  }
  window.location.href = '/admin/login.html';
}

async function getSession() {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (result && result.success && result.data && result.data.user) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function initAuthGuard() {
  const isLoginPage = window.location.pathname.includes('login.html');
  const session = await getSession();

  if (session) {
    if (isLoginPage) {
      window.location.href = '/admin/dashboard.html';
    }
    return session;
  }

  if (!isLoginPage) {
    window.location.href = '/admin/login.html';
  }
  return null;
}

export async function getCurrentUser() {
  return getSession();
}
