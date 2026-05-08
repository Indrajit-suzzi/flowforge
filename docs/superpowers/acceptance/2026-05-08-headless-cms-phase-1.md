# Acceptance Criteria: SaaS-Level Headless CMS (Phase 1)

**Spec:** `docs/superpowers/specs/2026-05-08-headless-cms-phase-1-design.md`
**Date:** 2026-05-08
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Tenant isolation in content types | API | User A and User B registered. User A creates content type "Blog". | User B GET /api/v1/content-types returns empty or only User B's types. |
| AC-002 | Tenant isolation in content entries | API | Content type "Blog" exists for both. User A creates entry "Post 1". | User B GET /api/v1/dynamic/blog returns empty or only User B's entries. |
| AC-003 | Automatic tenant tagging on create | Logic | JWT for User A used in POST request. Body does not include tenantId. | Created document in DB has `tenantId` field matching User A's ID. |
| AC-004 | Middleware rejection if no tenant | API | Request to protected route without valid JWT/tenant context. | Returns 401 Unauthorized or 403 Forbidden. |
| AC-005 | Update/Delete scoped to tenant | API | User B tries to DELETE an entry owned by User A. | Returns 404 Not Found or 403 Forbidden; document remains in DB. |
