export default function ProductLoading() {
  return (
    <div className="container py-12 max-w-6xl mx-auto animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-secondary rounded" />
        <div className="space-y-6 py-4">
          <div className="h-8 w-3/4 bg-secondary rounded" />
          <div className="h-6 w-1/4 bg-secondary rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-secondary rounded" />
            <div className="h-4 bg-secondary rounded" />
            <div className="h-4 w-2/3 bg-secondary rounded" />
          </div>
          <div className="h-12 bg-secondary rounded" />
        </div>
      </div>
    </div>
  );
}
