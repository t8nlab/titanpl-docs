import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/lib/layout.shared'
import { Package } from 'lucide-react'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const base = baseOptions()

  const addBadges = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      if (node.type === 'page') {
        const page = source.getPage(node.url.split('/').filter(Boolean).slice(1));
        if (page?.data.badge) {
          return {
            ...node,
            name: (
              <span key={node.url} className="flex w-full items-center justify-between gap-1">
                <span>{node.name}</span>
                <span
                  className={`flex h-4 items-center rounded-full border px-1.5 text-[9px] font-bold tracking-wider ${page.data.badge === 'ALPHA'
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-500'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                    }`}
                >
                  {page.data.badge}
                </span>
              </span>
            ),
          };
        }
      }
      if (node.type === 'folder') {
        return { ...node, children: addBadges(node.children) };
      }
      return node;
    });
  };

  const tree = {
    ...source.pageTree,
    children: addBadges(source.pageTree.children),
  };

  return (
    <DocsLayout
      tree={tree}
      {...base}
      sidebar={{
        banner: (
          <div className="p-2 font-medium flex gap-2 items-center bg-blue-600/20 border border-blue-600/60 text-blue-600 rounded-md">
            <Package color='#155dfc' size={20} /> Stable · v26.8.2
          </div>
        )
      }}
    >
      {children}
    </DocsLayout>
  )
}
