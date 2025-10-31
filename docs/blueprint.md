# **App Name**: TunnelVision AI

## Core Features:

- Device Management: Add, edit, and monitor devices (MikroTik/Linux) with status tracking.
- Tunnel Automation: Create and manage VPN tunnels, letting AI decide optimal protocols.
- User Management: Create, manage users with bandwidth quotas, and set expiration dates.
- VPN Configuration: One-click configuration for common VPN protocols based on AI analysis.
- AI Log Analysis: Send logs to the AI to perform automated problem detection and apply fixes.
- AI Topology Optimization: Use AI to get and automatically apply network topology suggestions.
- Settings Management: Manage Cloudflare settings.
- Network Monitoring: Monitor network and device status using the check-host.net API, displaying geographical locations and flags.

## Style Guidelines:

- Primary color: Purple (#7C4DFF), reflecting innovation and network intelligence. This color can represent both the robust technology and security provided.
- Background color: Dark gray (#1E1E1E) creates a modern, secure, and tech-focused atmosphere while allowing UI elements to stand out.
- Accent color: Teal (#00BFA6), used sparingly to highlight interactive elements and AI-driven insights. It provides a sense of trust, security, and technical precision.
- Headline font: 'Space Grotesk' (sans-serif) for a tech-forward, modern headline style. Body text: 'Inter' (sans-serif) offers a neutral and highly readable style for user instructions.
- Use @animate-ui/primitives-texts-sliding-number for animated icons (SlidingNumber), including: device/tunnel/user status and settings icons. Ensure teal glows on active/selected states.
- Aurora UI dark theme, cards with blur effects, and teal/purple gradients, aligning with modern network management tools.
- Subtle fade-in and slide-in animations (Framer Motion, 120-180ms) for transitions, plus SlidingNumber animations for statistics and state changes.