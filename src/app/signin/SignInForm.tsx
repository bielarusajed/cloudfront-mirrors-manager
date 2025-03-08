'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Уваход...' : 'Увайсці'}
    </Button>
  );
}

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    const result = await authenticate(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="container max-w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle>Уваход</CardTitle>
            <CardDescription>Увядзіце пароль для доступу</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <Input
                type="password"
                name="password"
                placeholder="Пароль"
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
