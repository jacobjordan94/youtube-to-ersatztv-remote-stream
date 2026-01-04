import { ArrowBigRight } from "lucide-react";

export default function () {
  return (
    <div className="text-center mb-12 drop-shadow-sm drop-shadow-white">
      <h1 className="text-4xl font-bold text-gray-200 mb-4">
        YouTube to ErsatzTV
      </h1>
      <div className="flex gap-4 items-center justify-center">
        <img src="images/youtube.webp" className='scale-75' alt="Youtube Logo" />
        <ArrowBigRight className="fill-white text-white scale-150" />
        <img src="images/ersatz.webp" className='ms-1' alt='ErsatzTV Logo' />
      </div>
      <div className="mt-4 flex justify-center">
        <p className="text-lg text-gray-300 max-w-md">
          Convert YouTube videos & playlists to ErsatzTV-compatible remote stream YAML files
        </p>
      </div>
    </div>
  );
}