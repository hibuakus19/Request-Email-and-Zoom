export default function ProtectedLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-1 items-center justify-center py-16"
    >
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-[3px] border-line border-t-accent"
      />
      <span className="sr-only">Memuat halaman...</span>
    </div>
  );
}
