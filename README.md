This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev

```

## Scraper

Scraper visits `https://www.npr.org/sections/allsongs/606254804/new-music-friday` and scrapes
the content for any links. These are links to different new-music-friday posts. It then
visits each of those posts and scrapes for the "featured albums." This content is presented
in a somewhat irregular manner — sometimes inside `<strong>` tags; sometimes not; sometimes
there are other variations — so we try to handle that and get just the artist name and
the album.

**Security**

`sanitizeHTML()` will sanitize the content, then `he.decode()` decodes the safe html.
