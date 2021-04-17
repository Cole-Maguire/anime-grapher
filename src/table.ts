import { getFirstDate } from "./util";

export function renderTable(works: WorkCache): HTMLElement[] {
    return Object.values(works)
        .sort((a, b) => getFirstDate(a).getFullYear() - getFirstDate(b).getFullYear())
        .map(constructElement)
}

function constructElement(work: Work) {
    const tr = document.createElement('tr');
    tr.dataset.workId = work.mal_id.toString();

    const link = document.createElement('a');
    link.href = work.url;
    link.textContent = work.title;
    link.target = '_blank'
    const name = document.createElement('td');
    name.appendChild(link)
    tr.appendChild(name)

    const type = document.createElement('td');
    type.textContent = work.type;
    tr.appendChild(type)

    const year = document.createElement('td');
    year.textContent = getFirstDate(work).getFullYear().toString();
    tr.appendChild(year)

    return tr;
}

function mouseListener(e: MouseEvent, colour: string): void {
    for (let eTarget of e.composedPath()) {
        let element = (eTarget as HTMLElement);
        if ('dataset' in element && element.dataset.workId) {
            const workId = element.dataset.workId
            const highlightElement: HTMLElement = document.querySelector(`g [id*='flowchart-${workId}-'] rect`);
            highlightElement.style.fill = colour
            return;
        }
    }
    //didn't hover over a useful element
}

export function mouseOverListener(e: MouseEvent): void {
    mouseListener(e, '#8FB339')
}
export function mouseOutListener(e: MouseEvent): void {
    mouseListener(e, '') // '' as a color not technically legal, but it works
}