import { environment } from '../../../environments/environment';

const API = environment.apiBaseUrl;
export const API_URLS = {
  auth: { login: `${API}/auth/login` },
  employees: {
    base: `${API}/employees`,
    byId: (id: string) => `${API}/employees/${encodeURIComponent(id)}`,
    deactivate: (id: string) => `${API}/employees/${encodeURIComponent(id)}/deactivate`,
    import: `${API}/employees/import`
  },
  countries: { base: `${API}/countries`, byCode: (code: string) => `${API}/countries/${encodeURIComponent(code)}` },
  salaryRevisions: `${API}/salary-revisions`,
  audit: `${API}/audit`
} as const;
