"use client";

import { cn } from "@freelii/utils";
import { useState } from "react";

type User = {
  id?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  avatarUrl?: string | null | undefined;
};

export function getUserAvatarUrl(user?: User | null) {
  if (user?.avatarUrl) return user.avatarUrl;

  return `https://avatar.vercel.sh/${encodeURIComponent(user?.id ?? user?.email ?? user?.name ?? "freelii")}`;
}

export function Avatar({
  user = {},
  className,
}: {
  user?: User;
  className?: string;
}) {
  if (!user) {
    return (
      <div
        className={cn(
          "h-10 w-10 animate-pulse rounded-full border border-gray-300 bg-gray-100",
          className,
        )}
      />
    );
  }

  const [url, setUrl] = useState(getUserAvatarUrl(user));

  return (
    <img
      alt={`Avatar for ${user.name || user.email}`}
      referrerPolicy="no-referrer"
      src={url}
      className={cn("h-10 w-10 rounded-full border border-gray-300", className)}
      draggable={false}
      onError={() => {
        setUrl(
          `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
            user.id || "",
          )}`,
        );
      }}
    />
  );
}

export function TokenAvatar({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <img
      src={`https://api.dicebear.com/9.x/shapes/svg?seed=${id}`}
      alt="avatar"
      className={cn("h-10 w-10 rounded-full", className)}
      draggable={false}
    />
  );
}
