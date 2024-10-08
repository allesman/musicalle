import GeniusApi from "$lib/GeniusApi";
import { splitArtist } from "$lib/stringUtils";
import { error, type RequestEvent } from "@sveltejs/kit";

// FIXME: caching (especially for splitting artists)
export const gameActions = {
  search: async ({ request }: RequestEvent) => {
    const data = await request.formData();
    const geniusApi = await GeniusApi.initialize();
    console.assert(geniusApi, "GeniusApi not initialized");
    const query = data.get("songQuery");
    const artistId = data.get("artistId");
    const artistName = data.get("artistName");
    if (
      !artistId ||
      !artistName ||
      !query ||
      typeof query !== "string" ||
      typeof artistId !== "string" ||
      typeof artistName !== "string"
    ) {
      return error(400, "Query and ArtistId required");
    }
    const finalQuery = query + " " + artistName;
    console.log("Searching: " + finalQuery);
    // FIXME: use other api call in general (song), to 1) stop user from using tactical search, but this will need own search
    try {
      const data = await geniusApi.searchGenius(finalQuery);
      const searchResults = [];
      for (let i = 0; i < data.length; i++) {
        // for debugging
        const primaryOld = data[i].result.primary_artists;
        console.assert(primaryOld.length == 1, "Primary artist length not 1");

        let primary = [data[i].result.primary_artist];
        const primaryName: string = primary[0].name;
        // Check if song has combined artist (e.g. "Lana Del Rey & Quavo")
        // TODO: ensure it's not just an artist with "&" in their name (e.g. "Simon & Garfunkel")
        if (primaryName.includes(" & ") && !artistName.includes(" & ")) {
          // Clear old primary artist
          primary = [];
          // Split into seperate artists by "&"
          const splitArtists: string[] = splitArtist(primaryName, " & ");
          for (const a of splitArtists) {
            console.log("Split artist:" + a);
            // Add full artist object to primary artists
            const artistObj = await geniusApi.getArtistInfoFromName(a);
            if (!artistObj) {
              console.error("Artist not found: " + a);
              continue;
            }
            primary.push(artistObj);
          }
        }

        const features = data[i].result.featured_artists;
        const combinedArtists = primary.concat(features);
        // searchResults.push(data[i]); // Debug line, uncomment to see all results
        for (const element of combinedArtists) {
          if (element.id == artistId) {
            const song = data[i].result;
            song["combined_artists"] = combinedArtists;
            searchResults.push(song);
            break;
          }
        }
      }
      console.log(searchResults.length + " songs featured artist");
      // TODO: filter out results that aren't songs
      return JSON.stringify(searchResults);
    } catch (e) {
      console.error(e);
      return error(500, "Whut?");
    }
  },

  customGame: async ({ request }: RequestEvent) => {
    const data = await request.formData();
    const startArtistName = data.get("startArtist");
    const goalArtistName = data.get("goalArtist");
    console.log("Custom game: " + startArtistName + " -> " + goalArtistName);

    const geniusApi = await GeniusApi.initialize();
    console.assert(geniusApi, "GeniusApi not initialized");
    const newStartArtist = await geniusApi.getArtistInfoFromName(
      startArtistName as string
    );
    const invalidArtists: { s: boolean; g: boolean } = { s: false, g: false };
    if (!newStartArtist) {
      invalidArtists.s = true;
    }
    const newGoalArtist = await geniusApi.getArtistInfoFromName(
      goalArtistName as string
    );
    if (!newGoalArtist) {
      invalidArtists.g = true;
    }
    if (invalidArtists.g || invalidArtists.s) {
      return error(404, {
        message: "Artist not found",
        invalidArtists: invalidArtists,
      });
    }
    const artists = {
      startArtistId: newStartArtist.id,
      goalArtistId: newGoalArtist.id,
    };
    return JSON.stringify(artists);
  },
};
// satisfies Actions;
