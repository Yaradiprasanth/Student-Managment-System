export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}

