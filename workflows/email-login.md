# Sign in with a private email link

Status is accepted. The user approved the complete workflow package on 16 November 2026.

## Goal

Allow the owner to access the same saved plan and progress across devices at `https://cs50track.dhaf.in`.

## Trigger

An unauthenticated visitor opens a protected route. Show an email field and Send login link. All plan, session, result, export, and account endpoints require an authenticated owner session.

## Access rule

Allow only the owner email configured on the server. There is no public registration, invite flow, or other learner's plan in the first release. Trim whitespace and compare email addresses case-insensitively. Never derive the owner from the first person to request a login.

The owner email is an operational configuration input supplied by the user before production verification. Do not invent an address or put it in public client code.

## Request a link

Validate the email input at the server boundary. For any syntactically valid email, respond with the same neutral check-your-email message. Only send to the configured owner. Rate-limit by email and request source, allowing at most three requests for that address in 15 minutes and ten requests per source in 15 minutes. Give a retry time when the request is limited.

Generate a random token with at least 32 bytes of entropy, store only its digest, and expire it after 15 minutes. Build the link from the configured production origin. Accept only relative internal return paths. Deliver through Cloudflare's native email binding to the configured, verified owner destination. Do not return or log the login token in production.

If delivery fails, show a retryable delivery error for the eligible owner without claiming that a link was sent. Keep provider details in server logs without the token. Development may use an explicit local email capture adapter. It must not create a production authentication bypass.

## Use a link

Opening a link shows a short Continue to CS50 Track confirmation. Consume the token only on the confirmation POST so mail-link scanners do not sign the owner in or invalidate the link through a GET request.

Consume the token atomically. A used, expired, or invalid token does not create a session. Show Request a new link. Successful confirmation creates a server-side session and a Secure, HttpOnly, SameSite=Lax cookie, then redirects to the safe requested route or Today.

Sessions expire after 30 days. Logging out revokes the session and clears its cookie. Reject cross-origin state-changing requests. A valid token cannot authenticate a different email or alter the allowed owner.

## Operational setup

Use TanStack Start on Cloudflare Workers, Cloudflare D1 for the owner account, sessions, token digests, and study records, and Cloudflare Email Service for delivery. Configure the domain, owner email, sender address, and email binding before production verification. Sender-domain DNS setup and destination verification depend on the user's Cloudflare account and cannot be proved from public documentation.

Keep production credentials out of the repository and request them through the private secret tool when needed. Apply the initial database schema through a recorded migration. Production deployment is a separate final step after the local app and deployment artifacts are concrete and reviewable.

## Acceptance examples

- An unlisted email cannot create an account or read study records.
- An expired link offers a new-link action.
- Concurrent confirmation requests for the same token create at most one successful authentication.
- A mail scanner's GET does not consume the token.
- Logging out makes the old session unusable.
- Saved progress survives logout and a later login on another device.
- Local email capture cannot be enabled accidentally in the production environment.
