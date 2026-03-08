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
      <Notice title='Titan v3.0.0 is Live — The Titan Engine' variant='success'>
        <p className='opacity-90'>
          ⚡ <strong>Major Architecture Update:</strong> Pre-compiled Native Engine and instant cold starts and more.
          <Link href='/docs/how-titan-works' className='ml-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-400/30 underline-offset-4'>
            View Architecture &rarr;
          </Link>
        </p>
      </Notice>
      {children}
    </HomeLayout>
  );
}
