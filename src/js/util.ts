function isAnime(w: Work): w is Anime {
    return 'aired' in w;
}

function isManga(w: Work): w is Manga {
    return 'published' in w;
}

export function getFirstDate(work: Work): Date {
    if (work === undefined) {
        return new Date(8640000000000000); // For as yet undefined dates. This is max date in js
    } else if (isAnime(work)) {
        return new Date(work.aired.from);
    } else if (isManga(work)) {
        return new Date(work.published.from)
    }
    throw new Error("Unknown work type");
}