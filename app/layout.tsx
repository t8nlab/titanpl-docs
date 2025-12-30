import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Notice from './components/Notice';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Titan Planet Framework Docs',
  description:
    'Official documentation for Titan Planet Framework — a JavaScript-first backend framework that compiles JS into a native Rust + Axum server powered by the Boa JavaScript engine.',
  keywords: [
    'Ezet Galaxy Titan',
    'EzetGalaxyTitanPlanet',
    'Titan Framework',
    'Titan Planet',
    'Rust backend',
    'JavaScript backend',
    'Rust Axum',
    'Boa JavaScript engine',
    'Backend framework',
    'Zero config backend',
    'JS to Rust',
  ],
  authors: [{ name: 'Ezet Galaxy' }],
  creator: 'Titan Planet',
  publisher: 'Titan Planet',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: 'Titan Planet Framework Docs',
    description:
      'Build high-performance native Rust backends using pure JavaScript. Official Titan Planet documentation.',
    siteName: 'Titan Planet Docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Titan Planet Framework Docs',
    description:
      'JavaScript simplicity. Rust power. Native backends powered by the Boa engine.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body cz-shortcut-listen="true" className="flex flex-col min-h-screen">
        <RootProvider>
          <Notice variant='warning'>
            <strong>Don&#39;t install <code>v25.15.5</code>, it&#39;s a broken version of titan</strong>
          </Notice>
          <Notice>
            The Titan CLI command is now <strong>titan</strong>.
            <br />
            The previous <code>tit</code> command is still supported as a legacy alias.
          </Notice>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
