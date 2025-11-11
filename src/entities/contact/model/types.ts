import { LocationInfo } from '@/src/entities/company/model/types';

export interface ContactInfo {
  id: string;
  email: string;
  address: string;
  businessHours: string;
  phone: {
    main: string;
    manager: string;
  };
  fax: string;
  location: LocationInfo;
}

