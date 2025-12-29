import { source } from '@/lib/source';
import { DocsLayout, DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: DocsLayoutProps) {
  const base = baseOptions();

  return (
    <DocsLayout tree={source.pageTree}
      {...base}
    >
      {children}
    </DocsLayout>
  );
}
