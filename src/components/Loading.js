export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1625]">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  );
}
