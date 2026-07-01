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
