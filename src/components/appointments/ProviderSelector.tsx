
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Search } from "lucide-react";
import { Provider } from './appointmentData';
import { Input } from "@/components/ui/input";

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProvider: string | undefined;
  onSelectProvider: (providerId: string | undefined) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ 
  providers, 
  selectedProvider, 
  onSelectProvider 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-2 border-b bg-muted/5 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search providers..." 
              className="pl-7 h-8 text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="max-h-[220px] overflow-y-auto scrollbar-none animate-fadeIn">
          <div
            className={`flex items-start p-2 cursor-pointer transition-all ${
              selectedProvider === undefined 
                ? 'bg-primary/5 border-l-4 border-primary font-medium' 
                : 'hover:bg-muted/10 border-l-4 border-transparent hover:border-primary/50'
            }`}
            onClick={() => onSelectProvider(undefined)}
          >
            <Users className="h-3.5 w-3.5 mt-0.5 mr-2" />
            <div>
              <div className="text-sm">All Providers</div>
              <div className="text-xs text-muted-foreground">
                View all appointments
              </div>
            </div>
          </div>
          
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <div
                key={provider.id}
                className={`flex items-start p-2 cursor-pointer transition-all ${
                  selectedProvider === provider.id 
                    ? 'bg-primary/5 border-l-4 border-primary font-medium' 
                    : 'hover:bg-muted/10 border-l-4 border-transparent hover:border-primary/50'
                }`}
                onClick={() => onSelectProvider(provider.id)}
              >
                <div 
                  className="h-4 w-4 mt-0.5 mr-2 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: provider.color }}
                >
                  <User className="h-2.5 w-2.5 text-white" />
                </div>
                <div>
                  <div className="text-sm">{provider.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {provider.specialty}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground text-xs">
              No providers found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderSelector;
