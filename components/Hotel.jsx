import Image from "next/image";
import Link from "next/link";
import { BedDouble, Star } from "lucide-react";

const Hotel = ({ hotel, averageRating }) => {
  const hotelImage =
    (hotel.images && hotel.images.length > 0 && hotel.images[0]) ||
    "https://placehold.co/600x400";
  return (
    <Link
      href={`/details/${hotel._id}`}
      className="block group bg-surface rounded-2xl border border-hairline overflow-hidden hover:shadow-luxe transition-shadow duration-300"
    >
      <div className="relative">
        <Image
          width={500}
          height={500}
          src={hotelImage}
          alt={hotel.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-ink flex items-center gap-1">
          <BedDouble className="w-3 h-3" />
          {hotel.bedroomCapacity} Rooms Left
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-serif text-lg text-ink line-clamp-1">{hotel.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 text-brass-dark fill-current" />
            <span className="text-sm text-muted">{Number(averageRating)?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-muted text-sm mt-1">{hotel.location}</p>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className="font-bold text-ink">${hotel.rent}</span>
            <span className="text-muted text-sm ml-1">per night</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Hotel;