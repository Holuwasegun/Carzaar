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

export async function initAuthGuard() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login.html');

  try {
    const user = await account.get();
    if (isLoginPage) {
      window.location.href = '/admin/dashboard.html';
    }
    return user;
  } catch {
    if (!isLoginPage) {
      window.location.href = '/admin/login.html';
    }
    return null;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
