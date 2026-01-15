"use client"

import { useVersion } from '@/context/VersionContext'
import { Package } from 'lucide-react'

export default function SidebarBanner() {
    const { titanVersion } = useVersion();

    return (
        <div className="p-2 font-medium flex gap-2 items-center bg-blue-600/20 border border-blue-600/60 text-blue-600 rounded-md">
            <Package color='#155dfc' size={20} /> Stable · {titanVersion}
        </div>
    )
}
