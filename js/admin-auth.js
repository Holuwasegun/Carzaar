import { account } from './appwrite-client.js';

export async function login(email, password) {
  try {
    await account.createEmailPasswordSession(email, password);
    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    throw new Error(err.message || 'Login failed. Check your credentials.');
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
  } catch (err) {
    console.warn('Logout error:', err);
  }
  window.location.href = '/admin/login.html';
}

export function initAuthGuard() {
  const currentPage = window.location.pathname;

  account.get()
    .then(user => {
      if (currentPage.includes('login.html')) {
        window.location.href = '/admin/dashboard.html';
      }
    })
    .catch(() => {
      if (!currentPage.includes('login.html')) {
        window.location.href = '/admin/login.html';
      }
    });
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
