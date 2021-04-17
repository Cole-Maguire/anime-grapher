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
        from: Date;
        to: Date;
    };
}

interface Manga extends Work {
    published: {
        from: Date;
        to: Date;
    };
}

interface Relation {
    mal_id: number;
    type: 'manga' | 'anime' //may not actually be complete;
    name: string;
    url: string;

    relation?: string //this is something we add in after the fact
}