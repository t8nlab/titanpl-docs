import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from "next/image"


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
        text: "Github",
        url: "https://github.com/ezet-galaxy/-ezetgalaxy-titan",
        active: "nested-url"
      },
    ]
  };
}
