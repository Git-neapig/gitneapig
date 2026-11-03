# 42 OAuth Setup and Deferred Verification

Status: application not registered by the team. Real provider login and onboarding
are intentionally unverified. No fake provider or demo login is substituted.

1. A team-authorized operator registers the GitneaPig application in the 42 API
   application dashboard. Keep ownership with the team rather than inventing an
   account or using an unapproved personal contact.
2. Choose the real deployment origin. Register its exact callback URL:
   `<service-origin>/api/v1/auth/42/callback`. Scheme, host, port and path must match.
   The existing local TLS environment uses
   `https://localhost:8443/api/v1/auth/42/callback`.
3. Put `OAUTH_42_CLIENT_ID`, `OAUTH_42_CLIENT_SECRET` and
   `OAUTH_42_REDIRECT_URI` in the ignored local environment or the deployment
   secret store. Never put the client secret in frontend code, commits, screenshots,
   URLs shown to users, or chat. Set `APP_ORIGIN` to the same exact service origin.
4. Restart the backend with these values; use a trusted HTTPS certificate.
5. Test with actual authorized 42 accounts: provider consent, existing-user return,
   new-user nickname/avatar onboarding, cancel/error paths, return-path handling,
   state mismatch rejection and onboarding context expiry.
6. Confirm stable 42 subject identity is used and email does not auto-link an
   existing password account. Check authentication cookies and private cache rules.
7. Record browser/environment/date and observed outcomes without exposing codes,
   tokens, client secrets or private account information.

Automated local state/onboarding tests do not establish live provider integration.
Official reference: https://api.intra.42.fr/apidoc
