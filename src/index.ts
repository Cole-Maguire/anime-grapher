import mermaid from 'mermaid'
import Queue from './queue'

const API_URL = "https://api.jikan.moe/v3";

const malQueue: Queue<Work> = new Queue(1000, 2)

let animeCache: { [mal_id: number]: Work } = {}

window.onload = () => {
  mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' })
  document.querySelector("#search-button")
    .addEventListener('click', async () => {
      animeCache = {}
      const animeId = Number((document.querySelector("#anime-id") as HTMLInputElement).value)
      const anime = await malQueue.queue(() => getAnime(animeId, 'anime'))
      recurseAnime(anime)
    });

}

function renderGraph() {
  document.querySelector("#mermaid-text").textContent = JSON.stringify(animeCache);

  const nodes = Object.values(animeCache)
    .map(anime => mapNode(anime));

  const relations = new Set(Object.entries(animeCache)
    .flatMap(parent => Object.entries(parent[1].related)
      .flatMap(relation => {
        relation[1].map(relatedAnime =>
          relatedAnime.relation = relation[0]);
        return relation[1]
      })
      .map(relation => mapRelation(parent[1].mal_id, relation))
      .map(relation => relation.join('')))
  )

  const graphText = 'graph LR\n' + nodes.join('\n') + '\n' + Array.from(relations).join('\n')
  console.log(graphText)

  const mermaidOutput = mermaid.mermaidAPI.render('mermaid-graph-inner', graphText);
  document.querySelector('#mermaid-graph').innerHTML = mermaidOutput;
}
function mapNode(work: Work) {
  //I hate pretending ASCII is all that exists like this, but Mermaid is picky about what it accepts :(
  const title = work.title.replace(/[\u{0080}-\u{FFFF}]/gu, "_")

  if (work.type === 'Manga') {
    return `${work.mal_id}[<img src='${work.image_url}' height='100' width='70' /> <br /> ${title}]`
  } else {
    return `${work.mal_id}(<img src='${work.image_url}' height='100' width='70' /> <br /> ${title})`
  }
}

function mapRelation(parentId: number, relation: Relation): [number, string, number] {
  switch (relation.relation) {
    case 'Sequel':
      return [parentId, '-->|Sequel|', relation.mal_id]
    case 'Prequel':
      return [relation.mal_id, '-->|Sequel|', parentId]
    case 'Adaptation':
      return relation.mal_id > parentId ? [relation.mal_id, '===|Adaptation|', parentId] : [parentId, '===|Adaptation|', relation.mal_id]
    case 'Side story':
      return [parentId, '-.->|Side story|', relation.mal_id]
    case 'Summary':
      return [parentId, '-.->|Summary|', relation.mal_id]

    case 'Parent story':
    case 'Full story':
      return [null, null, null]

    default:
      return relation.mal_id > parentId ? [relation.mal_id, `-.-|${relation.relation}|`, parentId] : [parentId, `-.-|${relation.relation}|`, relation.mal_id]
  }
}

async function recurseAnime(anime: Work): Promise<void> {

  let relatedAnimeList = await Promise.all(
    Object.values(anime.related)
      .flatMap(i => i)
      .filter(related => !(related.mal_id in animeCache))
      .map(related => malQueue.queue(async () => {
        const relatedAnime = await getAnime(related.mal_id, related.type);
        renderGraph()
        return relatedAnime
      })));
  // We let the promises settle so that timeout work properly

  relatedAnimeList.forEach(related => recurseAnime(related))

}

async function getAnime(id: number, type: string): Promise<Work> {
  if (id in animeCache) {
    return animeCache[id]
  }

  const raw = await fetch(`${API_URL}/${type}/${id}`);

  if (raw.ok) {
    let res = await raw.json();
    animeCache[id] = res;
    return res;
  } else {
    console.error(raw)
    return null;
  }
}



