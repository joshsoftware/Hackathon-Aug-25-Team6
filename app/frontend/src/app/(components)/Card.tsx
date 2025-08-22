interface CardProps {
  title: string;
  url: string;
  thumbnailUrl: string;
}

export default function Card({ title, url, thumbnailUrl }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">
          {title}
        </h2>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700 mt-2 inline-block"
        >
          View Full Size
        </a>
      </div>
    </div>
  );
}