
export interface Provider {
  id: string;
  name: string;
  role: string;
  specialty: string;
  color: string;
  availability?: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
  };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  color: string;
}

export const mockProviders: Provider[] = [
  {
    id: 'prov-1',
    name: 'Dr. John Smith',
    role: 'Primary Physician',
    specialty: 'Family Medicine',
    color: '#4f46e5',
    availability: {
      monday: ['9:00 AM - 12:00 PM', '1:00 PM - 5:00 PM'],
      tuesday: ['9:00 AM - 12:00 PM', '1:00 PM - 5:00 PM'],
      wednesday: ['9:00 AM - 12:00 PM'],
      thursday: ['9:00 AM - 12:00 PM', '1:00 PM - 5:00 PM'],
      friday: ['9:00 AM - 3:00 PM'],
    }
  },
  {
    id: 'prov-2',
    name: 'Dr. Sarah Johnson',
    role: 'Specialist',
    specialty: 'Cardiology',
    color: '#16a34a',
    availability: {
      monday: ['8:00 AM - 1:00 PM'],
      tuesday: ['8:00 AM - 1:00 PM'],
      wednesday: ['1:00 PM - 6:00 PM'],
      thursday: ['8:00 AM - 1:00 PM'],
      friday: ['8:00 AM - 12:00 PM'],
    }
  },
  {
    id: 'prov-3',
    name: 'Dr. Michael Chen',
    role: 'Specialist',
    specialty: 'Neurology',
    color: '#ca8a04',
    availability: {
      monday: ['10:00 AM - 4:00 PM'],
      tuesday: ['10:00 AM - 4:00 PM'],
      wednesday: ['10:00 AM - 4:00 PM'],
      thursday: ['10:00 AM - 4:00 PM'],
      friday: ['10:00 AM - 2:00 PM'],
    }
  },
  {
    id: 'prov-4',
    name: 'Dr. Lisa Rodriguez',
    role: 'Primary Physician',
    specialty: 'Pediatrics',
    color: '#dc2626',
    availability: {
      monday: ['9:00 AM - 5:00 PM'],
      tuesday: ['9:00 AM - 5:00 PM'],
      wednesday: ['9:00 AM - 5:00 PM'],
      thursday: ['9:00 AM - 5:00 PM'],
      friday: ['9:00 AM - 1:00 PM'],
    }
  },
  {
    id: 'prov-5',
    name: 'Dr. David Wilson',
    role: 'Specialist',
    specialty: 'Orthopedics',
    color: '#8b5cf6',
    availability: {
      monday: ['8:30 AM - 2:30 PM'],
      tuesday: ['11:30 AM - 5:30 PM'],
      wednesday: ['8:30 AM - 2:30 PM'],
      thursday: ['11:30 AM - 5:30 PM'],
      friday: ['8:30 AM - 12:30 PM'],
    }
  }
];

export const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'Main Medical Center',
    address: '123 Main St, Healthville, CA 90210',
    phone: '(555) 123-4567',
    color: '#4f46e5'
  },
  {
    id: 'loc-2',
    name: 'Downtown Clinic',
    address: '456 Market St, Healthville, CA 90211',
    phone: '(555) 987-6543',
    color: '#16a34a'
  },
  {
    id: 'loc-3',
    name: 'Westside Medical Office',
    address: '789 Ocean Ave, Healthville, CA 90212',
    phone: '(555) 456-7890',
    color: '#ca8a04'
  },
  {
    id: 'loc-4',
    name: 'North County Health Center',
    address: '321 Village Blvd, North Healthville, CA 90215',
    phone: '(555) 789-0123',
    color: '#dc2626'
  }
];
