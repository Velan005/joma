export default function ShopLoading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="h-8 w-1/4 bg-secondary mb-8 rounded" />
      <div className="flex gap-8">
        <div className="w-56 h-96 bg-secondary hidden lg:block rounded" />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-secondary rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
