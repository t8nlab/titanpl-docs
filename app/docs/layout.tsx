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

  return (
    <DocsLayout
      tree={source.pageTree}
      {...base}
      sidebar={{
        banner: (
          <div className="p-2 font-medium flex gap-2 items-center bg-blue-600/20 border border-blue-600/60 text-blue-600 rounded-md">
           <Package color='#155dfc' size={20} /> Stable · v25.16.0
          </div>
        )
      }}
    >
      {children}
    </DocsLayout>
  )
}
