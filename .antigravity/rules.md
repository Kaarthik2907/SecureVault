# SecureVault Project Architectural Guardrails

## Tech Stack
- Backend: Java 17, Spring Boot 3, Spring Security, JWT (HS256)
- Database: MySQL 8.0
- Frontend: React (Vite), TypeScript, Tailwind CSS
- Security: Cryptographic SHA-256 Hash Chaining

## Code Generation Conventions
- All API request/response keys MUST use camelCase.
- All endpoints MUST be versioned under `/api/v1/`.
- Backend MUST use layered architecture: Controller -> Service -> Repository -> Entity.
- All DTOs MUST be explicit Java records or immutable classes.
- Security: NEVER store raw passwords; use BCryptPasswordEncoder.
