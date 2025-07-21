import { Wallpaper } from "../components/Wallpaper";

export function HomeView() {
  return (
    <Wallpaper>
      <div className="min-h-screen flex items-center justify-center relative z-10 text-white">
        <h1 className="text-4xl font-bold">GWArchivist</h1>
      </div>
    </Wallpaper>
  );
} 