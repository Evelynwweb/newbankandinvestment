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

## Design system

Tokens live in `src/index.css` under `:root`, with a light-mode override on
`html[data-dash-theme='light']` that the dashboard and auth shells stamp on `<html>` while mounted.

| Token | Dark | Role |
| --- | --- | --- |
| `--bg` | `#0E0904` | warm espresso base |
| `--card` / `--card-soft` | `#1B1108` / `#26190C` | surfaces |
| `--gold` | `#E4C79A` | champagne secondary |
| `--gold-bright` → `--ember` | `#F59E0B` → `#EA580C` | the amber accent gradient |
| `--rose` | `#FCD34D` | gradient highlight |
| `--cream` | `#FFF7EC` | primary text |
| `--up` / `--down` | `#34D399` / `#FB7185` | credit / debit |

Typography: **Clash Display** (headings), **General Sans** (body), **JetBrains Mono** (figures).

## Structure

```
src/
  Homepage.jsx              marketing landing page
  App.jsx                   routes (lazy-loaded per screen)
  index.css                 design tokens + shared animation classes
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
    components/             layout shell, navs, stepper, banners, tour, support widget, rate widgets
    pages/                  Accounts, Transfers, Cards, Invest, Portfolio, Deposit,
                            Withdrawal, Loans, Transactions, Referrals, Settings, KYC
```

## Notes

- **KYC is a hard gate.** Until identity documents are submitted, the dashboard redirects to
  `/dashboard/kyc`, and withdrawals stay locked until verification is approved.
- **Card numbers rendered on the Cards screen are illustrative.** A production deployment must
  never render a full PAN in the browser — surface only the last four digits.
- **Rates and returns are placeholder content.** The target rates on market-linked mandates are
  written as objectives, not guarantees, and the disclosure copy reflects that. Keep it that way,
  and have compliance review the wording before this goes near real customers.
