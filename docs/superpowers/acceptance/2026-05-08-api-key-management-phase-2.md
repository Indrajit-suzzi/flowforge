# Acceptance Criteria: API Key Management (Phase 2)

**Spec:** `docs/superpowers/specs/2026-05-08-api-key-management-phase-2.md`
**Date:** 2026-05-08
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-201 | API Key Generation | API | User logged in. POST /api/v1/api-keys with name and scopes. | Returns 201 Created and the *raw* API key string. |
| AC-202 | Auth via API Key | API | API Key "KEY_1" generated for User A. | GET /api/v1/dynamic/blog with header `X-API-KEY: KEY_1` returns 200 OK. |
| AC-203 | Tenant isolation via API Key | API | KEY_1 belongs to User A. User B has entry "B1". | GET /api/v1/dynamic/blog with `X-API-KEY: KEY_1` does NOT return "B1". |
| AC-204 | Scoped Access (Success) | API | KEY_1 has "read" scope for "blog". | GET /api/v1/dynamic/blog with `X-API-KEY: KEY_1` returns 200 OK. |
| AC-205 | Scoped Access (Failure) | API | KEY_1 has "read" scope for "blog". | POST /api/v1/dynamic/blog with `X-API-KEY: KEY_1` returns 403 Forbidden. |
| AC-206 | Key Revocation | API | KEY_1 deleted via DELETE /api/v1/api-keys/:id. | Subsequent requests with `X-API-KEY: KEY_1` return 401 Unauthorized. |
