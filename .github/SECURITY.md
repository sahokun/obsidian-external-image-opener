# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this plugin, please report it by
[opening an issue](https://github.com/sahokun/open-image-externally/issues/new)
with the label **"security"**.

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report and work on a fix.

## Scope

This plugin runs on desktop only and uses Node.js `child_process.execFile()`
to open images with external programs. The custom program path is configured
by the user in the plugin settings.
