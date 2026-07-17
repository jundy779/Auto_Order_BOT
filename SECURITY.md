# Security Policy

FUSIONIFY BOT handles store operations, payments, product delivery, balances,
and administrative access. Please report suspected vulnerabilities privately
and responsibly.

## Supported Versions

Security fixes are provided for the latest production release made available
through an official FUSIONIFY BOT channel.

| Version | Supported |
|---|:---:|
| Latest production release | ✅ |
| Older releases | ❌ |
| Modified or unauthorized copies | ❌ |

Customers with an active rental or support package should use the latest
release provided for their instance.

## Reporting a Vulnerability

Do not report vulnerabilities through public GitHub issues, discussions,
Telegram groups, social media, or public chat rooms.

Report privately through:

- Telegram: [@TempestVPNOfficial](https://t.me/TempestVPNOfficial)
- WhatsApp: [Private security contact](https://wa.me/6283111380628)

Include as much of the following as possible:

- A clear description of the issue and potential impact
- The affected feature, screen, or user flow
- Reproduction steps using a test account or test environment
- Expected and actual behavior
- Screenshots or logs with sensitive values redacted
- The date and approximate time of testing
- A suggested mitigation, if available

Never include live bot tokens, passwords, API keys, private keys, MongoDB URIs,
merchant credentials, customer data, payment details, or product credentials.
If sensitive data is encountered, stop testing and report it immediately.

## Response Process

We aim to:

1. Acknowledge a complete report within three business days.
2. Validate the report and assess its impact.
3. Request additional information when required.
4. Prepare and test a fix for confirmed vulnerabilities.
5. Coordinate disclosure after affected customers have reasonable time to
   update.

These targets are best-effort and may vary based on complexity, third-party
dependencies, and customer deployment conditions.

## Scope

Examples of issues that may be in scope:

- Unauthorized access to the admin panel
- Access-control bypass between admin roles
- Payment confirmation or transaction-integrity issues
- Unauthorized balance, stock, refund, reseller, or delivery changes
- Exposure of credentials or private customer data
- Vulnerabilities in public HTTP surfaces owned by FUSIONIFY BOT
- Cross-site scripting, injection, request forgery, or unsafe file handling

The following are out of scope:

- Social engineering, phishing, or physical attacks
- Denial-of-service, traffic flooding, or resource-exhaustion testing
- Spam, mass messaging, or disruption of Telegram users
- Testing customer production instances without explicit permission
- Attacks against Telegram, payment providers, Pterodactyl, hosting services,
  or other third parties
- Reports based only on an outdated or modified unauthorized copy
- Issues requiring already-compromised credentials without demonstrating an
  additional security-boundary failure
- Automated scanner output without a reproducible security impact

## Safe Testing Rules

- Test only systems, accounts, and data you own or have written permission to
  test.
- Prefer a test instance and test merchant account.
- Use the minimum-impact proof of concept.
- Do not access, modify, retain, or delete another person's data.
- Do not interrupt production services or complete real unauthorized payments.
- Do not install persistence, create backdoors, or move laterally.
- Do not demand payment or threaten disclosure.
- Delete any accidentally obtained sensitive data after confirming receipt of
  the report.

Following these rules does not authorize access to customer systems or waive
the proprietary software license.

## Disclosure and Recognition

Do not publish vulnerability details before a fix is available and affected
customers have been given reasonable time to update.

Reporter credit may be provided with permission. This policy does not promise
a monetary bounty, reward, or public acknowledgement.

## Proprietary Software

FUSIONIFY BOT is proprietary software. Security research permission does not
grant permission to copy, redistribute, disclose, reverse engineer, or access
the Software outside the rules above. See [LICENSE](LICENSE) for applicable
license terms.
