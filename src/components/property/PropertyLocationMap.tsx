import React, { useMemo } from "react";
import { MapPin } from "lucide-react";

interface Location {
  state?: string;
  localGovernment?: string;
  area?: string;
  streetAddress?: string;
}

interface PropertyLocationMapProps {
  location: Location;
  propertyTitle?: string;
}

export const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  location,
  propertyTitle = "Property Location",
}) => {
  const mapData = useMemo(() => {
    if (!location) return null;

    const addressParts = [
      location.streetAddress,
      location.area,
      location.localGovernment,
      location.state,
    ]
      .filter(Boolean)
      .join(", ");

    if (!addressParts) return null;

    return {
      address: addressParts,
      encodedAddress: encodeURIComponent(addressParts),
    };
  }, [location]);

  if (!mapData) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Property Location
        </h3>
        <p className="text-gray-500 text-sm">
          Location information not available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Property Location
        </h3>
      </div>

      <div className="relative w-full h-80 bg-gray-100">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${mapData.encodedAddress}&t=m&z=15&output=embed&iwloc=near`}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="p-6">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {mapData.address}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Click the map to view full details on Google Maps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocationMap;
