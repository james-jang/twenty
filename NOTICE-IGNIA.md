# Ignia modification notice (GNU AGPLv3 section 5(a))

This is a modified version of Twenty (https://github.com/twentyhq/twenty), version v2.57.1
(upstream tag `twenty/v2.57.1`, commit f7fed3afdc7de0d2c171952bf246062bbdc2f194).
It is operated by Ignia as "Ignia CRM, built on Twenty". It is not the Twenty product and is
not endorsed by Twenty.

Modified by Ignia on 2026-11-12. The files changed relative to the upstream tag are:

- `packages/twenty-server/src/engine/core-modules/auth/constants/max-workspaces-without-organization-key.constant.ts`:
  the workspace cap is removed (`MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY` is `Number.POSITIVE_INFINITY`).
- `packages/twenty-server/src/engine/core-modules/emailing-domain/constants/community-emailing-domain-drivers.constant.ts`:
  `EmailingDomainDriver.AWS_SES` is added to `COMMUNITY_EMAILING_DOMAIN_DRIVERS`.
- `packages/twenty-front/src/modules/settings/hooks/useSettingsNavigationItems.tsx`:
  a Settings navigation link, "Ignia CRM, built on Twenty. Source for this version", points to the
  source of the running version (tag `ignia-v2.57.1-2` of https://github.com/james-jang/twenty).
- `packages/twenty-server/src/engine/core-modules/jwt/services/jwt-wrapper.service.ts`:
  token verification accepts only ES256 tokens with a known `kid`; the HS256 key derived from `APP_SECRET`
  and the API_KEY legacy-secret retry are removed (a forged-token isolation hardening; nothing signs HS256).
- `packages/twenty-server/src/engine/core-modules/jwt/services/__tests__/jwt-wrapper.service.spec.ts`:
  new unit spec for the ES256-only verification.
- `packages/twenty-server/src/engine/core-modules/workspace-data-export/services/workspace-data-export.service.ts`:
  the admin-panel workspace data export refuses a workspace whose `allowImpersonation` is false
  (support access must be opted in by the workspace).
- `packages/twenty-server/src/engine/core-modules/workspace-data-export/services/__tests__/workspace-data-export.service.spec.ts`:
  new unit spec for that check.
- `NOTICE-IGNIA.md`: this notice.

No file marked `@license Enterprise` is modified. `LICENSE` is unchanged, including the Twenty
Application Exception. Corresponding Source for each deployed version is the matching `ignia-v*` tag of
https://github.com/james-jang/twenty.
