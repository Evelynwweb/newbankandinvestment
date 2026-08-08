# Aurivest — Investment & Banking Frontend

A React + Vite frontend for a combined **banking and investment** platform: insured deposit
accounts, cards, transfers, managed investment mandates, loans and financial planning.

The UI design system is deliberately identical in structure to the `kinfovestment` project —
same layout grammar, motion primitives, scrollytelling stage, dashboard shell and component
vocabulary — but rendered in an **amber / ember** palette rather than that project's violet one,
and rebuilt around banking and investing products. There is no live trading or copy trading here.

## Running it

```bash
npm install
```

```bash
npm run dev
```

The app runs standalone — **no backend required**. When `VITE_API_URL` is unset, `src/lib/api.js`
routes every request to an in-browser demo backend (`src/lib/mockApi.js`) that persists to
localStorage and implements the same routes a real server would.

Sign in with the seeded demo client:

```
demo@aurivest.com / demo1234
```

Or open a new account through `/register` — the verification code is printed to the browser console.
"Reset demo data" in Account Settings wipes the store and reseeds it.

### Pointing at a real backend

Set the base URL and nothing else changes — the demo adapter switches itself off:

```bash
echo "VITE_API_URL=http://localhost:5000" > .env
```

The routes the backend must implement are the ones handled in `src/lib/mockApi.js` — auth,
`/api/dashboard/overview`, accounts, transfers, cards, investments, portfolio, transactions,
deposits, withdrawals, loans, referrals, profile and KYC.

## Design system — "Atelier"

Warm ivory paper carries the argument; deep noir bands carry the drama;
champagne gold marks the moments that matter. Tokens live in `src/index.css`;
the dashboard and auth shells stamp `data-dash-theme` on `<html>` for the dark variant.

| Token | Light | Role |
| --- | --- | --- |
| `--paper` / `--paper-2` | `#FBF8F3` / `#F3ECE0` | page and inset backgrounds |
| `--surface` / `--surface-2` | `#FFFFFF` / `#F8F3EA` | cards |
| `--rule` / `--rule-soft` | `#E6DBC7` / `#F1E9DB` | hairlines |
| `--ink` / `--ink-2` | `#17130E` / `#3A322A` | primary and secondary text |
| `--accent` | `#B45309` | the amber the brand rests on |
| `--noir` / `--gold-leaf` | `#0F0C08` / `#D8B475` | cinematic bands and the gold used on them |

Typography: **Fraunces** (display serif), **Inter** (body), **JetBrains Mono** (figures).

### Signature pieces

- `components/home/GoldDust.jsx` — canvas mote field that links into a faint
  constellation and parts around the pointer. Pauses off-screen; renders one
  static frame under `prefers-reduced-motion`.
- `components/home/FlapBoard.jsx` — split-flap rate board. Characters shuffle,
  then land, a beat after the board scrolls into view.
- `components/home/GrowthStory.jsx` — the pinned scroll story. A compounding
  curve inks itself across four viewport-heights while the balance climbs and
  captions hand over.
- `components/home/JourneyRail.jsx` — horizontal rail of five life moments,
  driven by vertical scroll so it never traps the page.

All motion is plain IntersectionObserver + rAF — no animation library. `useInView`
carries a 2.5s failsafe so a background tab can never leave the page at opacity 0.

## Structure

```
src/
  Homepage.jsx              marketing landing page
  App.jsx                   routes (lazy-loaded per screen)
  index.css                 design tokens, editorial furniture, one reveal
  auth/                     AuthContext, shell, login, 3-step registration, email verification
  components/
    home/                   Navbar, Footer, ScrollStage, LandingChatbot
    ui/                     motion primitives, BrandMark, LoadingScreen
  lib/                      api client, demo backend, useApi, formatters, theme
  pages/                    PageShell + About / Plans / Partners / Topic / Resources
  dashboard/
    Dashboard.jsx           overview
    dashboard.css           dashboard-only styles
    data.jsx                nav model, formatters, dashboard primitives
    components/             layout shell, navs, stepper, notices, support widget, rate widgets
    pages/                  Accounts, Transfers, Cards, Invest, Portfolio, Deposit,
                            Withdrawal, Loans, Transactions, Referrals, Settings, KYC
```

## Not built (deliberately)

These were cut from scope and are absent from the frontend, the backend and the
admin panel — not hidden behind a flag:

- **Email verification.** Accounts are usable the moment they're opened.
  To reintroduce it, see the note at the top of `invandbankbackend/routes/auth.js`.
- **Welcome bonus / account-opening gift.** Removed end to end, including the
  settings toggle and the claim endpoint.
- **Onboarding tour** and the **swipeable stat carousel** — the overview shows a
  single balance card and a plain figures grid at every width.

## Notes

- **KYC is still a hard gate.** Until identity documents are submitted, the
  dashboard redirects to `/dashboard/kyc`, and withdrawals stay locked until
  verification is approved.
- **Card numbers on the Cards screen are illustrative.** A production deployment
  must never render a full PAN in the browser.
- **Rates and returns are placeholder content.** Target rates on market-linked
  mandates are written as objectives, not guarantees. Have compliance review the
  wording before this goes near real customers.
