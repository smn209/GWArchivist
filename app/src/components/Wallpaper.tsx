import React from "react";

export function Wallpaper({ children, src = "/wallpapers/meditation.png" }: { children: React.ReactNode; src?: string }) {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${src})` }}>
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
} 