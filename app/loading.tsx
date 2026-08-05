export default function GlobalLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Top Progress Loading Bar */}
      <div className="h-1 w-full bg-[#5a58ab]/15 overflow-hidden">
        <div className="h-full bg-linear-to-r from-[#5a58ab] via-[#3f78e0] to-[#5a58ab] animate-pulse w-full transform -translate-x-full transition-transform duration-500 ease-out" />
      </div>
    </div>
  );
}
