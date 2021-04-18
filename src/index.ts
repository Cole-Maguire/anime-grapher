import mermaid from 'mermaid'
import { renderGraph } from './rendering'
import * as sidebar from './sidebar'
import * as malApi from './malApi';

const graph: HTMLElement = document.querySelector("#mermaid-graph")
const table: HTMLElement = document.querySelector("#work-list")
const searchbox: HTMLElement = document.querySelector("input#anime-id")
const searchResults: HTMLElement = document.querySelector("#search-results")

window.onload = () => {
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: 'loose',
    theme: "neutral"
  });

  const workId = new URLSearchParams(window.location.search).get("work_id")
  if (workId) {
    submitListener(workId)
  }
  
  table
    .addEventListener('mouseover', sidebar.mouseOverListener);
  table
    .addEventListener('mouseout', sidebar.mouseOutListener);
  searchbox
    .addEventListener('input', e => sidebar.search(e, searchResults));
}

async function submitListener(workId: string) {
  malApi.startRecurse(workId,
    c => {
      graph.innerHTML = renderGraph(c);
      table.innerHTML = '';
      table.append(...sidebar.renderTable(c));
    })
}

