# Fallout Website

## Deploy Configuration (configured by /setup-deploy)
- Platform: Vercel
- Production URL: https://fall0ut-website.vercel.app
- Deploy workflow: CLI deploy from local repo; GitHub auto-deploy pending Vercel GitHub app access to `chaypatil/fall0ut-website`
- Deploy status command: HTTP health check
- Merge method: direct push to `main`
- Project type: static web app
- Post-deploy health check: https://fall0ut-website.vercel.app

### Custom deploy hooks
- Pre-merge: none
- Deploy trigger: `npx.cmd --yes vercel --prod --yes`
- Deploy status: poll production URL
- Health check: https://fall0ut-website.vercel.app

### Custom domains
- `fall0ut.xyz` is attached to the Vercel project but DNS is not configured yet.
- `www.fall0ut.xyz` is attached to the Vercel project but DNS is not configured yet.
- Current nameservers: `parking1.gen.xyz`, `parking2.gen.xyz`
- Preferred handoff: domain owner changes nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
- Alternate DNS records from Vercel verification:
  - `A @ 216.198.79.1`
  - `A @ 64.29.17.1`
  - `CNAME www 6b61fc7ec40db849.vercel-dns-017.com.`
- Re-check after DNS changes: `npx.cmd --yes vercel domains verify fall0ut.xyz` and `npx.cmd --yes vercel domains verify www.fall0ut.xyz`.
