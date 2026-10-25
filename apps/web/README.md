# CacheCraft Web

Next.js client for CacheCraft: event discovery, seat reservations, bookings, and organizer event management.

## Requirements

- Node.js 20+ (the Docker image uses Node 24)
- npm
- A running CacheCraft API

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the API, including `/api`. Example: `http://localhost:4000/api` |

The value is read at build time by Next.js. Restart the dev server after changing it.

## Scripts

```bash
npm run dev       # Start the Next.js dev server
npm run build     # Production build + TypeScript check
npm start         # Serve the production build
npm run lint      # ESLint
npx tsc --noEmit  # Standalone typecheck
```

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and upcoming events |
| `/events` | Public | Published event discovery with URL-backed filters |
| `/events/[eventId]` | Public | Event details, seating chart, seat reservation |
| `/login`, `/register` | Guest | Authentication |
| `/dashboard` | Authenticated | Account overview |
| `/bookings` | Authenticated | Booking history |
| `/bookings/[bookingId]` | Authenticated | Booking details and cancellation |
| `/reservations` | Authenticated | Active reservation holds |
| `/reservations/[reservationId]` | Authenticated | Reservation countdown and checkout |
| `/account` | Authenticated | Profile settings |
| `/organizer` | Organizer | Organizer overview |
| `/organizer/events` | Organizer | Organizer event list |
| `/organizer/events/new` | Organizer | Create a draft event |
| `/organizer/events/[eventId]` | Organizer | Manage event, seats, and lifecycle actions |
| `/organizer/events/[eventId]/edit` | Organizer | Edit a draft or published event |

## Implementation Notes

- **Client-side API access.** JWTs are stored in `localStorage` under `cachecraft.accessToken`, so data fetching runs in client components.
- **Session handling.** Tokens last 15 minutes and there is no refresh endpoint. A `401` clears the token and emits `cachecraft:unauthorized`; the auth provider shows a session-expired toast.
- **Route guards.** `RequireAuth` and `GuestOnly` prevent protected content from rendering while auth is loading. They are client-side because tokens are browser-only.
- **Reservation context.** The API does not return event or seat details with reservations, so the client saves reservation context in `localStorage` under `cachecraft.reservationDetails`.
- **Booking receipts.** `GET /bookings/:id` omits booking items, so checkout saves a receipt in `sessionStorage` under `cachecraft.bookingReceipt` for the booking detail page.
- **Event filters.** `/events` uses `title`, `from`, and `page` search params. The events list only requests `PUBLISHED` events.
- **Seating.** Organizers add seat rows while an event is a draft. Existing rows are displayed as summaries; the current API has no seat edit/delete endpoints.
- **Styling.** Tailwind v4 theme tokens live in `src/app/globals.css`. The UI intentionally uses typography, color, and seating motifs instead of event photography.

## Known Backend Limitations

These are API/backend issues outside `apps/web` and currently prevent full live end-to-end verification:

- The API cannot boot as-is: `EventsModule` injects `BookingsRepository` without providing it, causing a Nest dependency-resolution error.
- `POST /events/:eventId/reservations` is not protected by `JwtAuthGuard`, but the handler expects `@CurrentUser()`. Reservation creation requires the missing guard/auth context.
- There is no venues API. The organizer event form accepts an existing venue UUID.
- `GET /bookings` and `GET /reservations/me` return unpaginated arrays.
- `GET /bookings/:id` does not include booking items or seat details.
- New bookings remain `PENDING`; there is no payment or confirmation flow.
- No refresh-token, password-reset, event-image, or seat-edit/delete endpoints are available.

## Verification

Last checked locally:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three complete successfully. Live API behavior still depends on resolving the backend issues above.
