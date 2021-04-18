import mermaid from 'mermaid'
import { renderGraph } from './rendering'
import * as sidebar from './sidebar'
import * as malApi from './malApi';

const graph: HTMLElement = document.querySelector("#mermaid-graph")
const table: HTMLElement = document.querySelector("#work-list")

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
  malApi.startRecurse(workId,
    c => {
      graph.innerHTML = renderGraph(c);
      table.innerHTML = '';
      table.append(...sidebar.renderTable(c));

      const highlightElement: HTMLElement = document.querySelector(`g [id*='flowchart-${workId}-'] rect`);
      highlightElement.style.stroke = '#D74E09'
    })
}

