
import Queue from './queue'
import Debounce from './debounce'
const API_URL = "https://api.jikan.moe/v3";

const malQueue: Queue<Work> = new Queue(1000, 2)
const malDebounce: Debounce<AnimeSearchResult[]> = new Debounce(1000);

let workCache: WorkCache = {}

export async function search(query: string): Promise<AnimeSearchResult[]> {
    const MAX_SEARCH_RESULTS = 10
    return malDebounce.debounce(async () => {
        if (query.length < 4) {
            // Mal doesn't like searches of less than three characters
            return Promise.resolve([]);
        }
        const raw = await fetch(`${API_URL}/search/anime?q=${query}`)
        const results = (await raw.json()) as SearchResults

        // Get at most 10 results
        return results.results.slice(0, Math.min(results.results.length, MAX_SEARCH_RESULTS))
    })
}

async function recurseWork(anime: Work, callback?: (c: WorkCache) => void): Promise<void> {

    let relatedAnimeList = await Promise.all(
        Object.values(anime.related)
            .flatMap(i => i)
            .filter(related => !(related.mal_id in workCache))
            .map(related => malQueue.queue(async () => {
                const relatedAnime = await getWork(related.mal_id, related.type);
                if (callback) {
                    callback(workCache);
                }
                return relatedAnime
            })));
    // We let the promises settle so that timeout work properly

    relatedAnimeList.forEach(related => recurseWork(related, callback))

}

async function getWork(id: number, type: string): Promise<Work> {
    if (id in workCache) {
        return workCache[id]
    }

    const raw = await fetch(`${API_URL}/${type}/${id}`);

    if (raw.ok) {
        let res = await raw.json();
        workCache[id] = res;
        return res;
    } else {
        console.error(raw)
        return null;
    }
}

export async function startRecurse(work: string, callback?: (c: WorkCache) => void) {
    workCache = {}
    const parsed = parseWorkInput(work)
    const anime = await malQueue.queue(() => getWork(parsed.id, parsed.type))
    await recurseWork(anime, callback)
    callback(workCache); // get in the final render, just in case of single anime franchises, etc.
}

function parseWorkInput(work: string): { type: string, id: number } {
    if (isFinite(Number(work))) {
        return { type: 'anime', id: Number(work) };
    } else {
        const matches: RegExpMatchArray | undefined = work.matchAll(/myanimelist\.net\/(?<type>manga|anime)\/(?<id>\d*)/g)
            .next() // This is not how you're meant to use iterators, but I don't care
            .value

        if (matches === undefined) {
            throw new Error("Bad work format")
        } else {
            return {
                type: matches.groups.type,
                id: Number(matches.groups.id)
            }
        }
    }
}

function max(length: number, MAX_SEARCH_RESULTSF: any): number {
    throw new Error('Function not implemented.');
}
