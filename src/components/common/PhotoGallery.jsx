import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

const PhotoGallery = ({ photos = [], onDelete = null }) => {
  const [preview, setPreview] = useState(null);

  if (photos.length === 0) {
    return <p className="text-sm text-gray-400 italic">No photos attached.</p>;
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={photo._id || index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
            <img
              src={photo.url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => setPreview(photo.url)}
                className="p-1.5 bg-white rounded-full hover:bg-gray-100"
              >
                <ZoomIn size={14} className="text-gray-700" />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(photo._id || index)}
                  className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                >
                  <X size={14} className="text-red-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white rounded-full"
            onClick={() => setPreview(null)}
          >
            <X size={20} />
          </button>
          <img src={preview} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg" />
        </div>
      )}
    </>
  );
};

export default PhotoGallery;