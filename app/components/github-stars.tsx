import { RiStarSFill } from "@remixicon/react";

export async function GithubStars() {
    let stars = null;

    try {
        const res = await fetch('https://api.github.com/repos/ezet-galaxy/titanpl', {
            next: { revalidate: 3600 },
        });

        if (res.ok) {
            const data = await res.json();
            stars = data.stargazers_count;
        }
    } catch (error) {
        console.error('Failed to fetch stats:', error);
    }

    return (
        <div className='flex items-center gap-2'>
            <span>Github</span>
            {stars !== null && (
                <div className='flex items-center gap-0.5 text-xs bg-zinc-500/10 px-1.5 py-0.5 rounded-full border border-black/5 dark:border-white/10'>
                    <span>titanpl •</span><RiStarSFill /> {stars}
                </div>
            )}
        </div>
    );
}
