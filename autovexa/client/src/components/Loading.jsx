export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
      <p className="mt-5 text-slate-500 font-medium text-sm">{message}</p>
    </div>
  );
}
