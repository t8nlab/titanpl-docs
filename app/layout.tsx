import { RootProvider } from 'fumadocs-ui/provider/next';
import { AuthProvider } from '@/context/AuthContext';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Notice from './components/Notice';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/next"
import Footer from './components/Footer';
import StatusBadge from './components/StatusBadge';
import { VersionProvider } from '@/context/VersionContext';

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
  verification: {
    google: "hMltFPqeOSHo-jwT47ISZC7XQWiYOWQE6pcUepmxeFk",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body cz-shortcut-listen="true" className="flex flex-col min-h-screen">
        <RootProvider>
          <AuthProvider>
            <VersionProvider>
              <Notice title='Titan v26.9.0 is Live' variant='success'>
                <p> Now with Strict TypeScript (Beta) & Hybrid Rust Actions!</p>
              </Notice>
              {children}
              <Footer />
              <Analytics />
              <Toaster position="bottom-right" reverseOrder={false} />
            </VersionProvider>
          </AuthProvider>
        </RootProvider>
      </body>
    </html>
  );
}
