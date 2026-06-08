# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening a
GitHub issue or contacting the maintainer directly.

Do NOT open a public issue for critical vulnerabilities — email
moqiuchen66@gmail.com instead.

## Scope

This library processes graph data structures in-memory. Security concerns
primarily relate to:

- Denial of service via malformed input (extremely large graphs)
- WASM sandbox escapes (mitigated by browser/Node.js WASM sandboxing)
- Supply chain attacks on dependencies

## Supported Versions

Only the latest minor version receives security fixes.
