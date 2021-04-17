import mermaid from 'mermaid'
import { start } from './malApi';
import { renderGraph } from './rendering'

window.onload = () => {
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: 'loose',
    theme: "neutral"
  })

  document.querySelector("#search")
    .addEventListener('submit', async (e: Event) => {
      e.preventDefault();

      const form = new FormData(e.target as HTMLFormElement);
      const mermaidElement = document.querySelector("#mermaid-graph")
      start(form.get("animeId").toString(),
        c => { mermaidElement.innerHTML = renderGraph(c) })
    });

}



