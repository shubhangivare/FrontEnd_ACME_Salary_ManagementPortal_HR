/**
 * Centralized backend URL configuration.
 * Change apiBaseUrl for a different backend host/environment.
 */
const apiBaseUrl = 'http://localhost:8080/api';

export const API_URLS = {
  base: apiBaseUrl,
  auth: {
    login: `${apiBaseUrl}/auth/login`
  },
  employees: {
    base: `${apiBaseUrl}/employees`,
    import: `${apiBaseUrl}/employees/import`,
    byId: (id: string) => `${apiBaseUrl}/employees/${encodeURIComponent(id)}`,
    deactivate: (id: string) => `${apiBaseUrl}/employees/${encodeURIComponent(id)}/deactivate`
  },
  countries: {
    base: `${apiBaseUrl}/countries`,
    byCode: (code: string) => `${apiBaseUrl}/countries/${encodeURIComponent(code)}`
  },
  salaryRevisions: {
    base: `${apiBaseUrl}/salary-revisions`
  },
  audit: {
    base: `${apiBaseUrl}/audit`
  }
} as const;
