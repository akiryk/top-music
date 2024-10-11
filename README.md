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

1. Start running the local server
2. Use the curl command below

This command will do a dry run and will get all data except for
the artist bio and it will log out the name of the artist and album but will not save it
to the database. Note that it won't get the data if the latest albums have already
been scraped.

```sh
# replace cron-secret-here with CRON_SECRET
curl -H "Authorization: Bearer cron-secret-here" "http://localhost:3000/api/cron?dryRun=true"
```

**Security**

`sanitizeHTML()` will sanitize the content, then `he.decode()` decodes the safe html.
