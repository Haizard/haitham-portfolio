/**
 * Formats a raw social media URL (YouTube, TikTok, Instagram) into an embeddable URL.
 * Supports:
 * - YouTube (Standard, Shortened, Embed)
 * - TikTok (Video)
 * - Instagram (Post, Reel)
 */
export function getVideoEmbedUrl(url: string | undefined): string | null {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&controls=1&mute=1&loop=1&playlist=${ytMatch[1]}&playsinline=1`;
    }

    // TikTok
    const tkMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    if (tkMatch && tkMatch[1]) {
        return `https://www.tiktok.com/embed/v2/${tkMatch[1]}?autoplay=1`;
    }

    // Instagram (Posts & Reels)
    const igMatch = url.match(/(?:instagram\.com\/(?:p|reels|reel)\/)([\w-]+)/);
    if (igMatch && igMatch[1]) {
        return `https://www.instagram.com/p/${igMatch[1]}/embed`;
    }

    return null;
}
