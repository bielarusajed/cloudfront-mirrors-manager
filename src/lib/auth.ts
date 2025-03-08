import {
  CloudFrontClient,
  ListDistributionsCommand,
} from '@aws-sdk/client-cloudfront';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from './constants';

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect('/signin');
}

export async function authenticate(formData: FormData) {
  const accessKeyId = formData.get('accessKeyId');
  const secretAccessKey = formData.get('secretAccessKey');
  const region = formData.get('region');

  if (!accessKeyId || typeof accessKeyId !== 'string') {
    return { error: 'AWS Access Key ID абавязковы' };
  }

  if (!secretAccessKey || typeof secretAccessKey !== 'string') {
    return { error: 'AWS Secret Access Key абавязковы' };
  }

  if (!region || typeof region !== 'string') {
    return { error: 'AWS Region абавязковы' };
  }

  try {
    // Праверым крэдэнцыялы, паспрабаваўшы атрымаць спіс distributions
    const cloudfront = new CloudFrontClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });

    await cloudfront.send(new ListDistributionsCommand({}));

    // Калі запыт паспяховы, захоўваем крэдэнцыялы ў cookie
    const cookieStore = await cookies();
    const credentials = JSON.stringify({
      accessKeyId,
      secretAccessKey,
      region,
    });

    cookieStore.set(AUTH_COOKIE_NAME, credentials, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
  } catch (error) {
    console.error('AWS authentication error:', error);
    return { error: 'Няправільныя AWS крэдэнцыялы' };
  }

  redirect('/');
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return !!cookieStore.get(AUTH_COOKIE_NAME);
}

export async function getAwsCredentials() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(authCookie.value) as {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
  } catch {
    return null;
  }
}
