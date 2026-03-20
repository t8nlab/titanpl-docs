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
      <Notice title='TitanPl v6.0.0 is Live — WebSockets Support Added' variant='success'>
        <p className='opacity-90'>
          ⚡ <strong>WebSockets Support Added:</strong> Real-time communication between client and server.
          <Link href='/docs/how-to-use/13-websockets' className='ml-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-400/30 underline-offset-4'>
            View Documentation &rarr;
          </Link>
        </p>
      </Notice>
      {children}
    </HomeLayout>
  );
}
