import * as d3 from "d3";
import { select, selectAll } from "d3-selection";
import { scaleSqrt, scaleLinear, scalePow } from "d3-scale";
import { max, min } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";
import { geoMercator, geoPath } from "d3-geo";
import { json } from "d3-fetch";
import { transition } from "d3-transition";
import { easeLinear } from "d3-ease";

import graphe1 from "../data/graph1_FoudreVsHuman.json";

// Dimensions du graphique
const width = 800;
const height = 300;

// Ajout du conteneur SVG
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("margin", "auto");

// Extraction des clés des données (à l'exception de la clé "Annee")
const keys = Object.keys(graphe1[0]).filter((key) => key !== "Annee");

// Échelle X pour les années
const yScale = d3
  .scaleBand()
  .domain(graphe1.map((d) => d.Annee))
  .range([0, height])
  .paddingInner(0.1);

const xScale = d3
  .scaleLinear()
  .domain([0, d3.max(graphe1, (d) => d3.sum(keys, (key) => d[key]))])
  .range([0, width]);

// Échelle de couleur pour les données
const colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeCategory10);

const colorScale2 = d3
  .scaleOrdinal()
  .domain(keys)
  .range(["#ffe3b5", "#A4CFF3"]);

// Création du groupe pour l'histogramme empilé
const stackGroup = svg
  .append("g")
  .selectAll("g")
  .data(d3.stack().keys(keys)(graphe1))
  .join("g")
  .attr("fill", (d) => colorScale2(d.key));

let bars = stackGroup
  .selectAll("g")
  .data((d) => d.filter((item) => item.data.Annee === graphe1[0].Annee))
  .join("g");

bars
  .append("rect")
  .attr("y", height / 2)
  .attr("x", (d) => xScale(d.Annee))
  .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
  .attr("height", yScale.bandwidth())
  .attr("class", "bar")
  /*.attr("class", (d, i) => "bar" + i)*/
  .on("mouseover", function (event, d) {
    tooltip
      .style("opacity", 1)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px").html(`<div class="legende1">
                        <span style="display:inline-block;width:15px;height:15px;background-color:#ffe3b5;margin-right:5px;"></span>
                        Total Foudre: ${d.data["Total Foudre"]} km2  
                    </div>
                    <div class="legende2">
                        <span style="display:inline-block;width:15px;height:15px;background-color:#A4CFF3;margin-right:5px;"></span>
                        Total Humain: ${d.data["Total Humain"]} km2  
                    </div>`);
  })
  .on("mouseout", function (event, d) {
    tooltip.style("opacity", 0);
  });

const tooltip = d3.select("body").append("div").attr("class", "tooltip");

const currentYearText = svg
  .append("text")
  .attr("x", 40)
  .attr("y", 300)
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", "30px")
  .attr("font-weight", "bold")
  .attr("class", "current-year")
  .text(`${graphe1[0].Annee}`);

//https://codepen.io/romanoe/pen/rNZKjvB Pour automatiser l'avancement des dates
d3.select("body")
  .append("button")
  .text("Next")
  .attr("class", "next-button")
  .on("click", () => {
    let currentYear = parseInt(bars.data()[0].data.Annee);
    let currentIndex = graphe1.findIndex((d) => d.Annee === currentYear);
    if (currentIndex === graphe1.length - 1) {
      currentIndex = -1;
    }
    let nextData = graphe1[currentIndex + 1];
    currentYearText.text(`${nextData.Annee}`);
    bars = stackGroup
      .selectAll("rect")
      .data((d) => d.filter((item) => item.data.Annee === nextData.Annee))
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("y", height / 2)
            .attr("height", yScale.bandwidth())
            .attr("fill", (d) => couleurScale(d.key))
            .attr("x", (d) => xScale(d[0]))
            .attr("width", 0)
            .call((enter) =>
              enter
                .transition()
                .duration(500)
                .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
            ),
        (update) =>
          update
            .attr("y", height / 2)
            .attr("x", (d) => xScale(d[0]))
            .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
            .call((update) =>
              update
                .transition()
                .duration(500)
                .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
            ),
        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(500).attr("width", 0).remove()
          )
      );
  });

/*const xAxis = d3.axisBottom(xScale);
svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

const yAxis = d3.axisLeft(yScale);
svg.append("g").call(yAxis);*/
