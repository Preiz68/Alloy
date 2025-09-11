export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"/>
    </div>
  )
}
