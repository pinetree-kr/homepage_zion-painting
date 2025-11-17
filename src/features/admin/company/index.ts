// Public API for admin/company feature
export { AboutTab } from './ui/AboutTab';
export { HistoryTab } from './ui/HistoryTab';
export { OrganizationTab } from './ui/OrganizationTab';

export {
  getCompanyInfo,
  saveAboutContent,
  saveOrganizationContent,
  getCompanyHistory,
  saveCompanyHistory,
} from './api/company-actions';

