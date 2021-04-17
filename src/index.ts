import mermaid from 'mermaid'
import { renderGraph } from './rendering'
import { mouseOutListener, mouseOverListener, renderTable } from './table'
import * as MalApi from './malApi';

const mermaidElement = document.querySelector("#mermaid-graph")
const tableElement = document.querySelector("#work-list")

window.onload = () => {
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: 'loose',
    theme: "neutral"
  })

  document.querySelector("#search")
    .addEventListener('submit', searchListener);

  tableElement
    .addEventListener('mouseover', mouseOverListener);
  tableElement
    .addEventListener('mouseout', mouseOutListener);

}

async function searchListener(e: Event) {
  e.preventDefault();

  const form = new FormData(e.target as HTMLFormElement);
  MalApi.startRecurse(form.get("animeId").toString(),
    c => {
      mermaidElement.innerHTML = renderGraph(c);
      tableElement.innerHTML = '';
      tableElement.append(...renderTable(c));
    })
}

