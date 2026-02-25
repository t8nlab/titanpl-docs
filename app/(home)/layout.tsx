import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import Notice from '../components/Notice';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <Notice title='Titan v26.15.4 is Live' variant='success'>
        <p className='opacity-90'>
          ⚡ <strong>Node.js Library Support:</strong> High-performance shims for Node core modules and npm libraries.
          <Link href='/docs/15-node-compatibility' className='ml-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-400/30 underline-offset-4'>
            View Documentation &rarr;
          </Link>
        </p>
      </Notice>
      <Notice title='Do not use v26.14.1' variant='warning'>
        <p>It's a broken version, you server may not start use a stable version v26.14.0 or v26.15.4</p>
      </Notice>
      {children}
    </HomeLayout>
  );
}
