export default function CategoryLoading() {
  return (
    <div className="flex flex-col w-full">
      <div className="h-[40vh] md:h-[50vh] bg-secondary animate-pulse" />
      <div className="container py-12">
        <div className="flex gap-2 mb-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-secondary rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
