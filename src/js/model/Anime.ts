interface Work {
    // reverse engineering only the fields we care about
    mal_id: number;
    title: string;
    image_url: string;
    url: string;
    type: string;
    related: { [relationName: string]: Relation[] };
}

interface Anime extends Work {
    aired: {
        from: string;
        to: string;
    };
}

interface Manga extends Work {
    published: {
        from: string;
        to: string;
    };
}

interface Relation {
    mal_id: number;
    type: 'manga' | 'anime' //may not actually be complete;
    name: string;
    url: string;

    relation?: string //this is something we add in after the fact
}

interface SearchResults {
    results: AnimeSearchResult[];
}

interface AnimeSearchResult {
    mal_id: number;
    title: string;
    image_url: string;
}