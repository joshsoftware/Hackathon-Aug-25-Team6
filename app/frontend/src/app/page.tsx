"use client";
import { useQuery } from "@tanstack/react-query";
import Loading from "./loading";
// import getPhotos from "./utils/temp/getPhotosData";
import Card from "./(components)/Card";
import getPhotos from "./utils/temp/getMoviesData";

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryFn: getPhotos,
    queryKey: ["photos"],
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Sorry There was an Error</div>;

  return (
    <div className="container mx-auto">
      <h1 className="p-5 box-decoration-slice bg-gradient-to-r from-indigo-600 to-pink-500 text-white text-center font-bold text-4xl">
        Photo Gallery
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-10">
        {data?.map((photo: {
          id: number;
          title: string;
          url: string;
          thumbnailUrl: string;
        }) => (
          <Card
            key={`photo-${photo.id}`}
            title={photo.title}
            url={photo.url}
            thumbnailUrl={photo.thumbnailUrl}
          />
        ))}
      </div>
    </div>
  );
}