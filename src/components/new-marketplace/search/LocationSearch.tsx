/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import {
  getStates,
  getLGAsByState,
  searchLocations,
  formatLocationString,
} from "@/utils/location-utils";

interface LocationSearchProps {
  value?: string;
  onChange: (location: string, details?: LocationDetails) => void;
  placeholder?: string;
  className?: string;
}

interface LocationDetails {
  state: string;
  lga: string;
  area?: string;
} 

interface LocationSuggestion {
  state: string;
  lga?: string;
  area?: string;
  display: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value = "",
  onChange,
  placeholder = "Enter state, LGA, or area...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setSelectedIndex(-1);
  });

  const getPopularLocations = (): LocationSuggestion[] => {
    return [
      {
        state: "Lagos",
        lga: "Lagos Island",
        area: "Victoria Island",
        display: "Victoria Island, Lagos Island, Lagos",
      },
      {
        state: "Lagos",
        lga: "Lagos Mainland",
        area: "Surulere",
        display: "Surulere, Lagos Mainland, Lagos",
      },
      {
        state: "Lagos",
        lga: "Ikeja",
        area: "Allen Avenue",
        display: "Allen Avenue, Ikeja, Lagos",
      },
      {
        state: "Lagos",
        lga: "Lekki",
        area: "Ajah",
        display: "Ajah, Lekki, Lagos",
      },
      {
        state: "Abuja",
        lga: "Municipal Area Council",
        area: "Garki",
        display: "Garki, Municipal Area Council, Abuja",
      },
      {
        state: "Abuja",
        lga: "Municipal Area Council",
        area: "Wuse",
        display: "Wuse, Municipal Area Council, Abuja",
      },
      {
        state: "Rivers",
        lga: "Port Harcourt",
        area: "GRA",
        display: "GRA, Port Harcourt, Rivers",
      },
      {
        state: "Kano",
        lga: "Kano Municipal",
        area: "Sabon Gari",
        display: "Sabon Gari, Kano Municipal, Kano",
      },
      {
        state: "Oyo",
        lga: "Ibadan North",
        area: "Bodija",
        display: "Bodija, Ibadan North, Oyo",
      },
      {
        state: "Anambra",
        lga: "Awka South",
        area: "Awka",
        display: "Awka, Awka South, Anambra",
      },
    ];
  };

  const searchSuggestions = async (
    query: string,
  ): Promise<LocationSuggestion[]> => {
    if (query.length < 2) {
      return getPopularLocations();
    }

    try {
      setLoading(true);

      // Use the existing utility function
      const results = searchLocations(query);

      // Transform results to our suggestion format
      const suggestions: LocationSuggestion[] = results.map((result) => ({
        state: result.state,
        lga: result.lga || "",
        area: result.area || "",
        display: formatLocationString(result.state, result.lga, result.area),
      }));

      // Also search for direct state/LGA matches
      const states = getStates();
      const stateMatches = states
        .filter((state) => state.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((state) => ({
          state,
          lga: "",
          display: state,
        }));

      // Get LGA matches for states
      const lgaMatches: LocationSuggestion[] = [];
      states.forEach((state) => {
        const lgas = getLGAsByState(state);
        const matchingLgas = lgas
          .filter((lga) => lga.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 2)
          .map((lga) => ({
            state,
            lga,
            display: `${lga}, ${state}`,
          }));
        lgaMatches.push(...matchingLgas);
      });

      // Combine and deduplicate
      const allSuggestions = [...suggestions, ...stateMatches, ...lgaMatches];
      const uniqueSuggestions = allSuggestions.filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.display === suggestion.display),
      );

      return uniqueSuggestions.slice(0, 10);
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (newValue.trim() === "") {
      setSuggestions(getPopularLocations());
      setIsOpen(true);
      return;
    }

    const results = await searchSuggestions(newValue);
    setSuggestions(results);
    setIsOpen(true);
  };

  const handleInputFocus = async () => {
    if (inputValue.trim() === "") {
      setSuggestions(getPopularLocations());
    } else {
      const results = await searchSuggestions(inputValue);
      setSuggestions(results);
    }
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.display);
    setIsOpen(false);
    setSelectedIndex(-1);

    onChange(suggestion.display, {
      state: suggestion.state,
      lga: suggestion.lga || "",
      area: suggestion.area || "",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearInput = () => {
    setInputValue("");
    setIsOpen(false);
    setSuggestions([]);
    onChange("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-[#8DDB90] border-t-transparent rounded-full"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent outline-none transition-colors text-sm"
          autoComplete="off"
        />

        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {inputValue.trim() === "" && (
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Popular Locations
                </span>
              </div>
            )}

            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion.state}-${suggestion.lga}-${suggestion.area}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  index === selectedIndex
                    ? "bg-[#8DDB90]/10 text-[#09391C]"
                    : "text-gray-700"
                }`}
                whileHover={{ backgroundColor: "rgba(141, 219, 144, 0.1)" }}
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.display}
                  </div>
                  {suggestion.area && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.lga}, {suggestion.state}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}

            {suggestions.length === 0 && !loading && inputValue.length >= 2 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No locations found for &quot;{inputValue}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearch;
