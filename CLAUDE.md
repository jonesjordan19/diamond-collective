# The Diamond Collective

This public repo holds the Next.js site for sluggercoin.com. The site serves college baseball players first, and most visitors use phones.

## Key files

- `src/app/page.tsx`: Main app, including the scoreboard, Brand Deals, Locker, and popups
- `src/app/api/secure/route.ts`: Verifies signed wallet requests and forwards them to Apps Script
- `src/components/HomeHero.tsx`: Signed-out homepage section
- `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`: Legal pages
- `src/app/globals.css`: Shared site styles

## Rules

- Never put secrets, private contact details, or personal notes in this repo.
- The public Apps Script feed may only contain approved public fields. Never add emails, phones, wallet addresses, video links, or hidden profiles.
- Send private actions through `/api/secure`.
- Keep brand intro recipients in Apps Script. Never accept a recipient from the browser.
- Promotional use requires `promoConsent` set to `TRUE`, and promotions can't use phone numbers or emails.
- Design and check phone layouts first.

## Changes

- Create a new branch and review its Vercel preview.
- The site owner merges to `main`.
- Apps Script changes need a matching deployment by the site owner. Decide the site and script release order before merging.
