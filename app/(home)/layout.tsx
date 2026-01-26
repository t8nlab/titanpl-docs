import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import Notice from '../components/Notice';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <Notice title='Titan v26.12.9 is Live' variant='success'>
        <p> Gravity Runtime: The Multi-threaded Synchronous Runtime!</p>
      </Notice>
      {children}
    </HomeLayout>
  );
}
