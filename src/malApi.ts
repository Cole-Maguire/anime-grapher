
import Queue from './queue'

const API_URL = "https://api.jikan.moe/v3";

const malQueue: Queue<Work> = new Queue(1000, 2)

let workCache: WorkCache = {}

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

export async function start(work: string, callback?: (c: WorkCache) => void) {
    workCache = {}
    const parsed = parseWorkInput(work)
    const anime = await malQueue.queue(() => getWork(parsed.id, parsed.type))
    recurseWork(anime, callback)
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