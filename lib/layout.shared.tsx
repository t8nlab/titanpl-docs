import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from "next/image"
import { GithubStars } from '@/app/components/github-stars';

import { RiDiscussFill } from "@remixicon/react";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <Image src={"/favicon.ico"} alt='Titan Planet Logo' height={32} width={32} className='object-cover' />
      ),
    },
    links: [
      {
        text: "Documentation",
        url: "/docs",
        active: "nested-url"
      },

      {
        text: "Benchmark",
        url: "/benchmark",
        active: "nested-url"
      },
      {
        text: "Observatory",
        url: "/observatory/download",
        active: "nested-url"
      },
      {
        text: "Changelog",
        url: "/changelog",
        active: "nested-url"
      },
      {
        text: <GithubStars />,
        url: "https://github.com/ezet-galaxy/titanpl",
        active: "nested-url"
      },
      {
        text: (
          <div className="group flex gap-2 items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg px-3 py-1 transition-all duration-300 w-full">
            <RiDiscussFill className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Join Community</span>
          </div>
        ),
        url: "/community",
        active: "nested-url"
      },
    ]
  };
}
