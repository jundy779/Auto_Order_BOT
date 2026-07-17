# Security Policy

## Supported Versions

Only the latest production release receives security fixes.

| Version | Supported |
|---|---|
| 8.9.x | ✅ |
| < 8.9 | ❌ |

Customers with an active rental should update to the latest release provided
through the official support channel.

## Reporting a Vulnerability

Do not report security vulnerabilities through public GitHub issues,
discussions, Telegram groups, or social media.

Report privately through:

- Telegram: [@TempestVPNOfficial](https://t.me/TempestVPNOfficial)
- WhatsApp: [Private security contact](https://wa.me/6283111380628)

Include:

- A clear description of the issue
- Affected feature or endpoint
- Reproduction steps
- Expected and actual behavior
- Impact assessment
- Screenshots or logs with sensitive values redacted
- Suggested mitigation, if available

Never include bot tokens, API keys, passwords, MongoDB URIs, private keys,
payment credentials, customer data, or live product credentials.

## Response Process

We will:

1. Acknowledge a complete report within 3 business days.
2. Validate the issue and determine its severity.
3. Provide status updates when material progress is made.
4. Prepare and test a fix for confirmed vulnerabilities.
5. Coordinate disclosure after affected customers have had reasonable time
   to update.

These targets are best-effort and may vary based on complexity and third-party
dependencies.

## Scope

In scope:

- Telegram bot transaction flows
- Admin panel authentication and authorization
- Payment callbacks and webhook verification
- Balance, stock, refund, reseller, and delivery logic
- Sensitive credential handling
- Public HTTP endpoints owned by this project

Out of scope:

- Social engineering
- Denial-of-service or traffic flooding
- Testing against customer production instances without permission
- Attacks against Telegram, payment providers, Pterodactyl, hosting providers,
  or other third-party services
- Issues that require a compromised admin account or leaked credential without
  demonstrating an additional security boundary failure

## Testing Rules

- Test only systems and accounts you own or have explicit permission to test.
- Do not access, modify, or delete customer data.
- Do not interrupt production services.
- Use minimum-impact proof of concept data.
- Stop testing and report immediately if sensitive data becomes accessible.
- Do not demand payment or threaten disclosure.

## Disclosure

Do not publish vulnerability details before a fix is available and affected
users have been given reasonable time to update.

Credit may be provided with the reporter's permission. This policy does not
guarantee a monetary bounty.

## Proprietary Software

This project is proprietary software. Security reporting permission does not
grant permission to copy, redistribute, reverse engineer, or access systems
outside the testing rules above.
