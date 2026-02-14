import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import Notice from '../components/Notice';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <Notice title='Titan v26.15.0 is Live' variant='success'>
        <p>⚡ Fast Path: Static Action Bypass</p>
      </Notice>
      <Notice title='Do not use v26.14.1' variant='warning'>
        <p>It's a broken version, you server may not start use a stable version v26.14.0 or v26.15.0</p>
      </Notice>
      {children}
    </HomeLayout>
  );
}
