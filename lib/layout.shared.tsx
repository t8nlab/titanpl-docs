import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className='border border-blue-800 bg-blue-600/20 px-2 rounded-bl-lg rounded-2xl'>Titan Planet</span>
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
