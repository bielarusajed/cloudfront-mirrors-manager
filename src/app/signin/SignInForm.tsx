'use client';

import { AWS_DEFAULT_REGION, AWS_REGIONS } from '@/lib/constants';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '../actions';

function CredentialsFields() {
  const { pending } = useFormStatus();
  return (
    <fieldset disabled={pending}>
      <label className="app-field">
        Ідэнтыфікатар ключа AWS
        <input
          type="text"
          name="accessKeyId"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </label>
      <label className="app-field">
        Сакрэтны ключ AWS
        <input type="password" name="secretAccessKey" autoComplete="current-password" required />
      </label>
      <label className="app-field">
        Рэгіён AWS
        <select name="region" defaultValue={AWS_DEFAULT_REGION}>
          {AWS_REGIONS.map((region) => (
            <option key={region.value} value={region.value}>
              {region.value} · {region.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="mirror-button mirror-button-primary signin-submit" aria-busy={pending}>
        {pending ? 'Уваход…' : 'Увайсці'}
      </button>
    </fieldset>
  );
}

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await authenticate(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="signin-page">
      <header className="signin-header">
        <h1>Люстэркі CloudFront</h1>
      </header>
      <div className="signin-content">
        <section className="signin-panel" aria-labelledby="signin-title">
          <h2 id="signin-title">Увайсці</h2>
          <p className="signin-description">Выкарыстайце ключы AWS для доступу да люстэркаў.</p>
          <form action={onSubmit} aria-describedby={error ? 'signin-error' : undefined}>
            <CredentialsFields />
            {error && (
              <p id="signin-error" className="mirror-error" role="alert">
                {error}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
