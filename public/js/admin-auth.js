export async function login(email, password) {
  try {
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, redirect: false }),
    });

    if (!response.ok) {
      throw new Error('Login failed. Check your credentials.');
    }

    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('Logout error:', err);
  }
  window.location.href = '/admin/login.html';
}

export async function initAuthGuard() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login.html');

  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('No session');
    }

    const session = await response.json();

    if (isLoginPage) {
      window.location.href = '/admin/dashboard.html';
    }
    return session;
  } catch {
    if (!isLoginPage) {
      window.location.href = '/admin/login.html';
    }
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
