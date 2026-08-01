# Database migrations

OUTLOOX now uses **Flyway** for schema management.

## Active Flyway migration location
- `src/main/resources/db/migration/`

## Notes
- JPA is configured with `ddl-auto=validate`
- Flyway creates and evolves schema
- `baseline-on-migrate=true` is enabled to ease transition from older local databases
- for production, always test migrations in staging first

## Legacy review artifacts
This `database/migrations/` folder is now documentation / review material only.
The actual runtime migrations are under `src/main/resources/db/migration/`.
