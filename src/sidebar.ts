import { getFirstDate } from "./util";

import * as MalApi from './malApi';

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

function mouseSidebar(e: MouseEvent, colour: string): void {
    for (let eTarget of e.composedPath()) {
        let element = (eTarget as HTMLElement);
        if ('dataset' in element && element.dataset.workId !== undefined) {
            const highlightElement: HTMLElement = document.querySelector(`g[id*='flowchart-${element.dataset.workId}-'] rect`);
            highlightElement.style.fill = colour
            return;
        }
    }
    //didn't hover over a useful element
}

function mouseGraph(e: MouseEvent, colour: string): void {
    for (let eTarget of e.composedPath()) {
        let element = (eTarget as HTMLElement);
        const match = element.id ? element.id.match(/flowchart\-(?<id>\d*)\-/) : null;
        if (match) {
            const highlightElement: HTMLElement = document.querySelector(`tr[data-work-id="${match.groups.id}"]`);
            highlightElement.style.backgroundColor = colour
            return;
        }
    }
    //didn't hover over a useful element
}

export function mouseOverSidebar(e: MouseEvent): void {
    mouseSidebar(e, 'var(--highlight)')
}
export function mouseOutSidebar(e: MouseEvent): void {
    mouseSidebar(e, '') // '' as a color not technically legal, but it works
}
export function mouseOverGraph(e: MouseEvent): void {
    mouseGraph(e, 'var(--highlight)')
}
export function mouseOutGraph(e: MouseEvent): void {
    mouseGraph(e, '') // '' as a color not technically legal, but it works
}

export async function search(e: Event, searchResults: HTMLElement) {
    const value = (e.target as HTMLInputElement).value

    const results = await MalApi.search(value);
    searchResults.innerHTML = '';
    const elements = results.map(constructLink);
    searchResults.append(...elements)
}

function constructLink(a: AnimeSearchResult): HTMLElement {
    const element = document.createElement('a');
    element.textContent = a.title;
    element.href = `?work_id=${a.mal_id}`

    const li = document.createElement("li");
    li.append(element);

    return li;
}

export function hideSidebarListener(e: Event) {
    document.querySelector("#sidebar").classList.toggle('minimised')
    const target = (e.target as HTMLButtonElement)

    // toggle icon
    target.textContent = target.textContent === '◀' ? '▶' : '◀'
}