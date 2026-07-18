async function getCsrfToken() {
  const res = await fetch('/api/auth/csrf', { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken;
}

export async function login(email, password) {
  const csrfToken = await getCsrfToken();

  const body = new URLSearchParams();
  body.append('email', email);
  body.append('password', password);
  body.append('redirect', 'false');
  body.append('json', 'true');
  body.append('csrfToken', csrfToken);

  const response = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Login failed. Check your credentials.');
  }

  const result = await response.json().catch(() => null);

  if (result && result.url) {
    window.location.href = result.url;
  } else {
    window.location.href = '/admin/dashboard.html';
  }
}

export async function logout() {
  const csrfToken = await getCsrfToken();

  try {
    const body = new URLSearchParams();
    body.append('csrfToken', csrfToken);

    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
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

    const session = await response.json();
    if (session && session.user) {
      return session;
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
