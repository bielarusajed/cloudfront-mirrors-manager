import { redirect } from 'next/navigation';
import { isAuthenticated } from './auth';

export async function checkActionAuth() {
  if (!(await isAuthenticated())) {
    redirect('/signin');
  }
}
