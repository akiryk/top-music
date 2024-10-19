This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev

```

## Scraper

**Scraping**
The app visits `https://www.npr.org/sections/allsongs/606254804/new-music-friday` and scrapes
the content for links to the most recent post. It then visits the post and scrapes for the "featured albums" section. Finally, it queries Spotify to get preview tracks and artwork for each of those albums.

**Saving**
Once the data is scraped, it gets saved to a POSTGRES database on Vercel.

**Run Time**
At runtime, the page gets data from the db and then queries Last.fm for an artist bio.

## Cron Job

The scraping is triggered by a cron job, which is enabled on Vercel and which uses configuration
options set in a `vercel.json` file in this repo.

**Testing the cron job**
Use the dry run command to test what content will be scraped and potentially added to
the database. The dry-run will show the content whether or not it would be added; in
prod, the cron-job checks if the album has already been scraped and doesn't add it if so.

Easy way: `pnpm dry-run`

Hard way:

1. Start running the local server
2. Use the curl command below

```sh
# replace cron-secret-here with CRON_SECRET
curl -H "Authorization: Bearer cron-secret-here" "http://localhost:3000/api/cron?dryRun=true"
```

**Security**

`sanitizeHTML()` will sanitize the content, then `he.decode()` decodes the safe html.
