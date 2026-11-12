import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Люстэркі CloudFront',
  description: 'Стварэнне і кіраванне люстэркамі CloudFront',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="be">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" visibleToasts={1} />
        </Providers>
      </body>
    </html>
  );
}
