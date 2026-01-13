import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from "next/image"
import { GithubStars } from '@/app/components/github-stars';

import { RiDiscussFill } from "@remixicon/react";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <Image src={"/favicon.ico"} alt='titan planet' height={38} width={38} className='rounded-full' />
      ),
    },
    links: [
      {
        text: "Documentation",
        url: "/docs",
        active: "nested-url"
      },

      {
        text: <GithubStars />,
        url: "https://github.com/ezet-galaxy/titanpl",
        active: "nested-url"
      },
      {
        text: (
          <div className="flex gap-2 items-center bg-blue-600/40 border-dashed border border-blue-600/80 px-1 dark:text-white text-black w-full py-1.5">
            <span>Join Community</span>
          </div>
        ),
        url: "/community",
        active: "nested-url"
      },
    ]
  };
}
