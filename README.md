# PeoplePay Angular frontend

Angular 19 standalone frontend for the PeoplePay Spring Boot API. Components use separate `.component.ts`, `.component.html`, and `.component.scss` files. Standalone components include `CommonModule` in their imports.

## Run

1. Start the backend from the separate backend ZIP on port 8080.
2. Install Node.js 20.11+ (or another Angular 19-supported Node version).
3. From this folder run:

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Local development accounts

- Admin: `admin` / `admin123`
- HR: `hr` / `hr123`

Employee, country, audit, and salary-revision data are loaded from API endpoints. The frontend does not seed employee data in browser storage. The backend's `schema.sql` and `db.sql` initialize the H2 database on startup.

## Security note

This is a development starter. It uses HTTP Basic credentials held in session storage by the frontend to call the local API. Do not deploy as-is or use real employee/salary data without HTTPS, production-grade session/token handling, secure secret management, and a security review.
