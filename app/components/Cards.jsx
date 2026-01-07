"use client"
import React from "react";
import {
  Link as LinkIcon,
  ThumbsUp
} from "lucide-react";
import Image from "next/image";



const CommunityPostCard = ({ post = {} }) => {
  const hasImage = Boolean(post.previewImage);
  const hasDescription = Boolean(post.description);

  return (
    <div className="w-full max-w-xl rounded-xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur p-4 space-y-4">
      {/* Preview / Description */}
      <div className="relative w-full min-h-48 h-full rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-center text-sm text-black/60 dark:text-white/50 p-4">
        {hasImage ? (
          <Image
            src={post.previewImage}
            alt={post.title || "Project preview"}
            fill
            className="object-cover"
          />
        ) : hasDescription ? (
          <p className="line-clamp-5">
            {post.description}
          </p>
        ) : (
          <span className="opacity-60">
            description or website preview image
          </span>
        )}
      </div>


      {/* Title */}
      <h3 className="text-lg font-semibold text-black dark:text-white">
        {post.title || "Titan"}
      </h3>

      {/* Link */}
      <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/60">
        <LinkIcon className="w-4 h-4 shrink-0" />
        <a
          href={post.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline truncate"
        >
          {post.url || ""}
        </a>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-sm text-black/60 dark:text-white/50">
        <span>{post.author || "anonymous"} • {post.createdAt || "just now"}</span>
        <button className="flex items-center gap-2 text-sm hover:text-black dark:hover:text-white transition">
          <ThumbsUp className="w-4 h-4" />
          <span>{post.likes ?? 0}</span>
        </button>
      </div>

    </div>
  );
};

export default CommunityPostCard;
