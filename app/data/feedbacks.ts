export type FeedbackItem = {
    author: string
    handle: string
    platform: "Hacker News" | "Twitter" | "LinkedIn"
    quote: string
    link: string
    gradient: string
}

export const feedbacks: FeedbackItem[] = [
    {
        author: "soham_byte",
        handle: "Project Author",
        platform: "Hacker News",
        quote: "The motivation is removing Node from production entirely and shipping a single native Rust binary... enabling a true multi-threaded execution model.",
        link: "https://news.ycombinator.com/item?id=46229761",
        gradient: "from-orange-500/20",
    },
    {
        author: "Andrew Vijay",
        handle: "@andrewvijay",
        platform: "Twitter",
        quote: "Brand new framework that compiles your JS code to Rust and compiles to single binary for easy deployment. The CLI is called tit. tit init, tit dev...",
        link: "https://twitter.com/andrewvijay/status/2001191346129002775",
        gradient: "from-blue-500/20",
    },
    {
        author: "pavelai",
        handle: "Hacker News",
        platform: "Hacker News",
        quote: "I see some benefits for this to make single-purpose servers compiled into tiny binaries. You should find the niche where it's required right now.",
        link: "https://news.ycombinator.com/item?id=46229761",
        gradient: "from-yellow-500/20",
    },
    {
        author: "Mohamed Amine Jmal",
        handle: "Full-Stack Developer",
        platform: "LinkedIn",
        quote: "Promising idea, especially for people who want native performance without leaving JS. Still feels early, but definitely an interesting experiment to follow.",
        link: "https://www.linkedin.com/feed/update/urn:li:share:7407352530193592321",
        gradient: "from-blue-600/20",
    },
    {
        author: "Tawfeeq Amro",
        handle: "Technical Manager | Solution Architect",
        platform: "LinkedIn",
        quote: "From developer experience perspective this is great, but i didn't understand how we can control Rust features like ownership browning",
        link: "https://www.linkedin.com/feed/update/urn:li:share:7407352530193592321",
        gradient: "from-blue-600/20",
    },
    {
        author: "Irfandy J.",
        handle: "Frontend Engineer",
        platform: "LinkedIn",
        quote: "👏👏👏 It’s all about time before JavaScript takes over the whole stack.",
        link: "https://www.linkedin.com/feed/update/urn:li:share:7407352530193592321",
        gradient: "from-blue-600/20",
    },
    {
        author: "topickapp",
        handle: "@topickapp_com",
        platform: "Twitter",
        quote: "Titan (ezetgalaxy/titan) is a backend framework that compiles JavaScript code into a Rust execution binary.",
        link: "https://twitter.com/topickapp_com/status/2002415194887111019",
        gradient: "from-blue-500/20",
    },
    {
        author: "Andre Fontenele.",
        handle: "Data Engineer | Professional Rustacean",
        platform: "LinkedIn",
        quote: "At this point why are we not compile JavaScript. The whole advantage of Rust is that it adds semantics for describing memory flow in your programs.",
        link: "https://www.linkedin.com/feed/update/urn:li:share:7407352530193592321",
        gradient: "from-blue-600/20",
    },
]
