import mermaid from 'mermaid'
import { getFirstDate } from './util';

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
    if (work.type === 'Manga') {
        return `${work.mal_id}["<img src='${work.image_url}' height='100' width='70' /><br />${work.title}"]`
    } else {
        return `${work.mal_id}("<img src='${work.image_url}' height='100' width='70' /><br />${work.title}")`
    }
}

function mapRelation(parent: Work, relation: { work: Work, relation: Relation }): [number, string, number] {
    switch (relation.relation.relation) {
        // Relation relation relation relation relation relation
        case 'Sequel':
            return [parent.mal_id, '-->|Sequel|', relation.relation.mal_id]
        case 'Adaptation':
            return dateOrdered(parent, relation, '==>|Adaptation|')

        case 'Parent story':
        case 'Full story':
        case 'Prequel':
            // These have differently named pairs (i.e. prequel -> sequel)
            // and so should be ignored to maintain graph clarity
            return [null, null, null]

        default:
            return dateOrdered(parent, relation, `-.->|${relation.relation.relation}|`)
    }
}

function dateOrdered(parent: Work, relation: { work: Work, relation: Relation }, arrowShape: string): [number, string, number] {
    const relationDate = getFirstDate(relation.work)
    const parentDate = getFirstDate(parent)
    return relationDate < parentDate ? [relation.relation.mal_id, arrowShape, parent.mal_id] : [parent.mal_id, arrowShape, relation.relation.mal_id]
}
