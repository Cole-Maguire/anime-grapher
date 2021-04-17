import mermaid from 'mermaid'

export function renderGraph(workCache: WorkCache) {

    const nodes = Object.values(workCache)
        .map(anime => mapNode(anime));

    const relations = new Set(Object.entries(workCache)
        .flatMap(parent => Object.entries(parent[1].related)
            .flatMap(relation => {
                relation[1].map(relatedAnime =>
                    relatedAnime.relation = relation[0]);
                return relation[1]
            })
            .map(relation => mapRelation(parent[1], { work: workCache[relation.mal_id], relation }))
            .map(relation => relation.join('')))
    )

    const graphText = 'graph LR\n' + nodes.join('\n') + '\n' + Array.from(relations).join('\n')

    return mermaid.mermaidAPI.render('mermaid-graph-inner', graphText);
}

function mapNode(work: Work) {
    //I hate pretending ASCII is all that exists like this, but Mermaid is picky about what it accepts :(
    const title = work.title.replace(/[\u{0080}-\u{FFFF};]/gu, "_")

    if (work.type === 'Manga') {
        return `${work.mal_id}[<img src='${work.image_url}' height='100' width='70' /> <br /> ${title}]`
    } else {
        return `${work.mal_id}(<img src='${work.image_url}' height='100' width='70' /> <br /> ${title})`
    }
}

function mapRelation(parent: Work, relation: { work: Work, relation: Relation }): [number, string, number] {
    switch (relation.relation.relation) {
        // Relation relation relation relation relation relation
        case 'Sequel':
            return [parent.mal_id, '-->|Sequel|', relation.relation.mal_id]
        case 'Adaptation':
            return dateOrdered(parent, relation, '==>|Adaptation|')
        case 'Side story':
            return [parent.mal_id, '-.->|Side story|', relation.relation.mal_id]
        case 'Summary':
            return [parent.mal_id, '-.->|Summary|', relation.relation.mal_id]

        case 'Parent story':
        case 'Full story':
        case 'Prequel':
            // These have differently named pairs (i.e. prequel -> sequel)
            // and so should be ignored to maintain graph clarity
            return [null, null, null]

        default:
            return dateOrdered(parent, relation, `-.-|${relation.relation.relation}|`)
    }
}

function isAnime(w: Work): w is Anime {
    return 'aired' in w;
}

function isManga(w: Work): w is Manga {
    return 'published' in w;
}

function getFirstDate(work: Work): Date {
    if (work === undefined) {
        return new Date(8640000000000000); // For as yet undefined dates. This is max date in js
    } else if (isAnime(work)) {
        return work.aired.from;
    } else if (isManga(work)) {
        return work.published.from
    }
    throw new Error("Unknown work type");
}

function dateOrdered(parent: Work, relation: { work: Work, relation: Relation }, arrowShape: string): [number, string, number] {
    const relationDate = getFirstDate(relation.work)
    const parentDate = getFirstDate(parent)
    return relationDate < parentDate ? [relation.relation.mal_id, arrowShape, parent.mal_id] : [parent.mal_id, arrowShape, relation.relation.mal_id]
}
