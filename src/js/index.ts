import mermaid from 'mermaid'
import { renderGraph } from './rendering'
import * as sidebar from './sidebar'
import * as malApi from './malApi';

const graph: HTMLElement = document.querySelector("#mermaid-graph")
const table: HTMLElement = document.querySelector("#work-list")
const loading: HTMLElement = document.querySelector("#loading");
const graphedTitle: HTMLElement = document.querySelector("h2#graphed-works");

window.onload = () => {
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: 'loose',
    theme: "neutral"
  });

  const workId = new URLSearchParams(window.location.search).get("work_id")
  if (workId) {
    graphWork(workId);
  }

  table.addEventListener('mouseover', sidebar.mouseOverSidebar);
  table.addEventListener('mouseout', sidebar.mouseOutSidebar);

  graph.addEventListener('mouseover', sidebar.mouseOverGraph);
  graph.addEventListener('mouseout', sidebar.mouseOutGraph);

  document.querySelector("button#hide-sidebar")
    .addEventListener('click', sidebar.hideSidebarListener);

  document.querySelector("button#zoom-out")
    .addEventListener('click', () => { zoomListener(-.1) });
  document.querySelector("button#zoom-in")
    .addEventListener('click', () => { zoomListener(.1) });

  const searchbox: HTMLElement = document.querySelector("input#anime-id")
  const searchResults: HTMLElement = document.querySelector("#search-results")
  searchbox.addEventListener('input', e => sidebar.search(e, searchResults));

  document.querySelector("form").addEventListener('submit', e => {
    e.preventDefault();
    if (searchResults.hasChildNodes) {
      // ul>li>a
      (searchResults.childNodes[0].childNodes[0] as HTMLLinkElement).click()
    }
  })
}

async function graphWork(workId: string) {
  loading.classList.remove('hidden')
  graphedTitle.style.display = 'block';
  await malApi.startRecurse(workId,
    c => {
      graph.innerHTML = renderGraph(c);
      table.innerHTML = '';
      table.append(...sidebar.renderTable(c));

      const highlightElement: HTMLElement = document.querySelector(`g [id*='flowchart-${workId}-'] rect`);
      highlightElement.style.stroke = '#D74E09'
    })
  loading.classList.add('hidden')
}

function zoomListener(multiplier: number) {
  const svg: HTMLElement = document.querySelector("svg#mermaid-graph-inner");
  const re = /scale\((?<factor>\d*\.?\d*)\)/
  if (!re.test(svg.style.transform)) {
    svg.style.transform = 'scale(1)'
  }
  const originalScale = Number(svg.style.transform.match(re).groups.factor)
  //Scale to increase size, and translate to make sure that we don't cut off the left hand edge
  const transformFactor = 100 * (originalScale + multiplier - 1)
  svg.style.transform = `scale(${originalScale + multiplier}) translate(${transformFactor}%, ${transformFactor}%)`;
}
