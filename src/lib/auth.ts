import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from './constants';

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect('/signin');
}

export async function authenticate(formData: FormData) {
  const password = formData.get('password');

  if (!password || typeof password !== 'string') {
    return { error: 'Пароль абавязковы' };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set');
    return { error: 'Памылка канфігурацыі' };
  }

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    redirect('/');
  }

  return { error: 'Няправільны пароль' };
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return !!cookieStore.get(AUTH_COOKIE_NAME);
}
