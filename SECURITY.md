# Security Policy

<!-- @gov:SEC-SLA -->

## Supported Versions

Only the latest release on the primary trunk (`main`) receives active security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

The ToDayLy project enforces a **Coordinated Vulnerability Disclosure (CVD)** process. Do not open public GitHub, Codeberg, or social media issues for suspected security vulnerabilities.

### Disclosure Channel
Report security vulnerabilities directly by email to:
**dzulkiflianwar2@gmail.com**

Include the following information in your advisory:
1. Description of the vulnerability and affected component.
2. Step-by-step reproduction instructions or proof-of-concept payload.
3. Assessment of impact and potential exploit scenarios.
4. Suggested remediation if available.

### Service Level Agreement (SLA) Commitments

The project maintains the following response timeline for reported vulnerabilities:

- **24 Hours:** Initial receipt acknowledgement and triage assignment.
- **72 Hours:** Technical reproduction and CVSS v3.1 severity rating.
- **14 Calendar Days:** Candidate patch development, automated testing, and regression audit.
- **30 Calendar Days:** Coordinated public release of security advisory and patch deployment.

## Security Architecture Invariants

1. **Zero External Telemetry:**<br>
   The application communicates with no third-party analytics, tracking, or remote metric endpoints.
2. **Local-First Sandbox:**<br>
   All data persistence occurs in local browser sandbox environments (LocalStorage, IndexedDB, WebAssembly memory).
3. **Safe Parsing Boundaries:**<br>
   Imported JSON, YAML, and CSV files are validated and sanitized before domain entity creation. Script injection vectors inside task names or descriptions are neutralized by framework DOM escaping.
