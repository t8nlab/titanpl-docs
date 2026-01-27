import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TitanPl Observatory',
    description: 'The professional environment for validating TitanPl servers.',
};

export default function ObservatoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
