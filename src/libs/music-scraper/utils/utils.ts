import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import he from "he";

export function getLatestPostFromNPRNewMusicFridayHTML(
  data: string
): string | null {
  const $ = cheerio.load(data);

  // Find the first link to a New Music Friday blog post
  const firstPostElement = $("h2.title").first();

  if (firstPostElement.length > 0) {
    const titleText = firstPostElement.text().trim(); // Get the album title text
    const newMusicFridayBlogPost = firstPostElement.find("a").attr("href"); // Get the first blog post link

    if (newMusicFridayBlogPost) {
      return newMusicFridayBlogPost;
    } else {
      console.log(`Found title: "${titleText}" but no link found`);
    }
  } else {
    console.log("No New Music Friday posts found.");
  }

  return null; // Return null if no valid post was found
}

// Get the Feature Albums section of HTML, which lists the day's top 5 albums
export function getFeaturedAlbumsElement($: cheerio.CheerioAPI, url: string) {
  // Load HTML into Cheerio

  const featuredAlbumsElement = $("main p, h3").filter((i, element) => {
    // return /feature?d albums/i.test($(element).text());
    return /feature?d albums/i.test($(element).text());
  });

  if (!featuredAlbumsElement) {
    console.error(`missing albums at ${url}`);
    return "";
  }

  let albumsContent = featuredAlbumsElement.html();

  if (featuredAlbumsElement.is("h3")) {
    const nextParagraph = featuredAlbumsElement.next("p"); // Get the next <p> sibling
    if (nextParagraph.length) {
      albumsContent = albumsContent
        ? albumsContent + nextParagraph.html()
        : nextParagraph.html(); // Append the HTML of the next <p> tag
    }
  }

  return albumsContent ?? "";
}

export function extractAlbumInformationFromHTML({
  rawHtmlContent,
  postDate,
  url,
}: {
  rawHtmlContent: string;
  postDate: Date;
  url: string;
}) {
  return rawHtmlContent
    .split("•")
    .slice(1)
    .map((album) => {
      const [artist, albumTitle] = album
        .trim()
        .replace(/<br\s*\/?>/g, "")
        .replace(/<\/em>/g, "")
        .replace(/<em>,/g, "<em>")
        .split("<em>");

      const artistName = artist.trim().replace(/,\s*$/, "");
      const albumalbumTitle = albumTitle.trim();
      const safeArtistName = removeZeroWidthChars(
        sanitizeHtml(artistName, {
          allowedTags: [], // Remove all HTML tags
          allowedAttributes: {},
        })
      );
      const safeAlbumalbumTitle = removeZeroWidthChars(
        sanitizeHtml(albumalbumTitle, {
          allowedTags: [],
          allowedAttributes: {},
        })
      );

      return {
        artist: he.decode(safeArtistName),
        title: he.decode(safeAlbumalbumTitle),
        postDate: postDate.toISOString().split("T")[0],
        url,
      };
    });
}

function removeZeroWidthChars(text: string) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Removes zero-width space, zero-width non-joiner, zero-width joiner, and zero-width no-break space
}
