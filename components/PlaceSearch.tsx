import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface PlaceSearchProps {
  onPlaceSelect: (place: any) => void;
}

export default function PlaceSearch({ onPlaceSelect }: PlaceSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    const checkGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
        setIsReady(true);
      } else {
        setTimeout(checkGoogleMaps, 500);
      }
    };
    checkGoogleMaps();
  }, []);

  useEffect(() => {
    if (isReady && inputRef.current && !autocompleteRef.current) {
      const options = {
        fields: ['place_id', 'name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'reviews', 'types', 'photos', 'geometry', 'opening_hours'],
        types: ['establishment'],
      };

      autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current, options);

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.place_id) {
          // User pressed enter without selecting a suggestion, or no details available
          // We will handle this in the search button click if needed, 
          // or we can try to search for what they typed.
          setSearchValue(inputRef.current?.value || '');
          return;
        }

        onPlaceSelect(place);
        setSearchValue(place.name || inputRef.current?.value || '');
        setError(null);
      });
    }
  }, [isReady, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setError(null);
  };

  const handleSearchButtonClick = () => {
    if (!isReady || !searchValue) return;

    // If the user manually typed something and hit search, we try to find it
    const service = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
    service.findPlaceFromQuery({
      query: searchValue,
      fields: ['place_id']
    }, (results: any, status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        service.getDetails({
          placeId: results[0].place_id,
          fields: ['place_id', 'name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'reviews', 'types', 'photos', 'geometry', 'opening_hours']
        }, (placeDetails: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
            onPlaceSelect(placeDetails);
            setError(null);
          } else {
            console.error('PlacesService.getDetails failed due to: ' + status);
            setError("Could not retrieve business details. Please try again.");
          }
        });
      } else {
        setError("No business found for your search. Please try a different query or select from suggestions.");
      }
    });
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          placeholder={isReady ? "Search for your business (Google Profile)..." : "Loading Google Maps..."}
          className={`block w-full rounded-xl border-gray-300 pl-12 pr-4 py-4 shadow-sm focus:border-brand-orange focus:ring-brand-orange text-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-all ${!isReady ? 'cursor-wait' : ''}`}
          disabled={!isReady}
        />
        <button
          onClick={handleSearchButtonClick}
          disabled={!isReady || !searchValue}
          className="ml-3 px-6 py-4 bg-brand-orange text-white rounded-xl shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 disabled:bg-gray-300 transition-all"
        >
          Search
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
          {error}
        </p>
      )}

      {!isReady && (
        <p className="mt-2 text-xs text-gray-400">
          Waiting for Google Places API... (Ensure your API Key is valid in index.html)
        </p>
      )}
    </div>
  );
}