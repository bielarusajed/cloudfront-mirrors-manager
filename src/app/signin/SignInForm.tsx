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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AWS_DEFAULT_REGION, AWS_REGIONS } from '@/lib/constants';
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
  const [region, setRegion] = useState(AWS_DEFAULT_REGION);

  async function onSubmit(formData: FormData) {
    formData.set('region', region);
    const result = await authenticate(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="container max-w-[450px]">
        <Card>
          <CardHeader>
            <CardTitle>Уваход з AWS крэдэнцыяламі</CardTitle>
            <CardDescription>
              Увядзіце вашы AWS крэдэнцыялы для доступу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  name="accessKeyId"
                  placeholder="AWS Access Key ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  name="secretAccessKey"
                  placeholder="AWS Secret Access Key"
                  required
                />
              </div>
              <div className="space-y-2">
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{region}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {AWS_REGIONS.map((region) => (
                      <SelectItem
                        key={region.value}
                        value={region.value}
                        className="flex flex-col items-start gap-1"
                      >
                        <div className="font-medium">{region.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {region.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
