# T-World Admin UI

A small React admin screen for the T-World backend. It's here to prove the API works end to end,
so it's simple on purpose. Built with React, Vite, Tailwind and TypeScript.

## Run it

The backend needs to be running first (see `server/README.md`).

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

The UI talks to `http://localhost:4000` by default. If your API is somewhere else, copy
`.env.example` to `.env` and change this:

```
VITE_API_URL=http://localhost:4000
```

To build it: `npm run build`.

## Logging in

Enter an email. It's the same simplified login as the API, with no password.

- An email listed in `ADMIN_EMAILS` on the server gives you the admin view.
- Any other email gives you a normal user.

## What's in it

| tab | what you can do |
| --- | --- |
| Content | list, search by text, filter by tag, page through. Pick an item, choose a tone and length, and run an AI summary. Admins can also add content |
| AI runs | see past runs with the output, status, latency and tokens earned |
| Tokens | see your balance and ledger, convert tokens to MOCK_USDT or MOCK_ETH, and withdraw a conversion |
| Media | upload a file, then promote it from short-term to long-term storage |
| Users | admin only: see everyone's balance and grant tokens for testing |

Your token balance shows in the top bar and updates after each summary or conversion.

If an AI call fails or times out, the Content tab shows the fallback summary with a note that no
tokens were awarded.

## How it's put together

```
src/
  main.tsx, App.tsx    app shell, login, tab navigation
  api.ts               one fetch helper that adds the token and handles errors
  constants.ts         status / role numbers, with labels for the screen
  types.ts             types for the API responses
  ui.tsx               a few shared bits (buttons, box, error message)
  pages/               one file per tab
```

The server sends statuses and roles as numbers. `constants.ts` mirrors the server's
`constants.ts` and maps each number to a label. If a value is added on the server, add it here too.

The login token is kept in `localStorage`, so a refresh keeps you signed in.
