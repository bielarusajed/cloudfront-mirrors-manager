import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SignInForm } from './SignInForm';

export default async function SignInPage() {
  if (await isAuthenticated()) {
    redirect('/');
  }

  return <SignInForm />;
}
