import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import Notice from '../components/Notice';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <Notice title='Titan v26.14.0 is Live' variant='success'>
        <p>The stable version, ready to use in production!</p>
      </Notice>
      {children}
    </HomeLayout>
  );
}
