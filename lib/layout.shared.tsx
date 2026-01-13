import { RiGithubFill } from '@remixicon/react';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from "next/image"
import { GithubStars } from '@/app/components/github-stars';

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
        icon: <RiGithubFill size={15} />,
        url: "https://github.com/ezet-galaxy/titanpl",
        active: "nested-url"
      },
      {
        text: <div className='bg-blue-600/40 border-dashed border border-blue-600/80 px-1 dark:text-white text-black'>Join Community</div>,
        url: "/community",
        active: "nested-url"
      },
    ]
  };
}
