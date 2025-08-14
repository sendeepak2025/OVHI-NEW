
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { Location } from './appointmentData';
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: string | undefined;
  onSelectLocation: (locationId: string | undefined) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  locations, 
  selectedLocation, 
  onSelectLocation 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-2 border-b bg-muted/5 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search locations..." 
              className="pl-7 h-8 text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="max-h-[220px] overflow-y-auto scrollbar-none animate-fadeIn">
          <div
            className={`flex items-start p-2 cursor-pointer transition-all ${
              selectedLocation === undefined 
                ? 'bg-primary/5 border-l-4 border-primary font-medium' 
                : 'hover:bg-muted/10 border-l-4 border-transparent hover:border-primary/50'
            }`}
            onClick={() => onSelectLocation(undefined)}
          >
            <MapPin className="h-3.5 w-3.5 mt-0.5 mr-2" />
            <div>
              <div className="text-sm">All Locations</div>
              <div className="text-xs text-muted-foreground">
                View all locations
              </div>
            </div>
          </div>
          
          {filteredLocations.length > 0 ? (
            filteredLocations.map(location => (
              <div
                key={location.id}
                className={`flex items-start p-2 cursor-pointer transition-all ${
                  selectedLocation === location.id 
                    ? 'bg-primary/5 border-l-4 border-primary font-medium' 
                    : 'hover:bg-muted/10 border-l-4 border-transparent hover:border-primary/50'
                }`}
                onClick={() => onSelectLocation(location.id)}
              >
                <div 
                  className="h-4 w-4 mt-0.5 mr-2 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: location.color }}
                >
                  <MapPin className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{location.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {location.address}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground text-xs">
              No locations found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
