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

// Importation des données depuis un autre fichier JavaScript
import data from "../data/graph1_FoudreVsHuman.json";

// Création d'une variable pour stocker l'année courante
let currentYear = 1990;

// Fonction pour créer un cercle de répartition (camembert) pour une année donnée
function createPieChart(year) {
  // Filtrage des données pour l'année spécifiée
  const filteredData = data.filter((d) => d.Annee === year);

  // Calcul du pourcentage de foudre et d'humain
  const total =
    filteredData[0]["Total Foudre"] + filteredData[0]["Total Humain"];
  const foudrePercent = (filteredData[0]["Total Foudre"] / total) * 100;
  const humainPercent = (filteredData[0]["Total Humain"] / total) * 100;

  // Création du cercle de répartition (camembert)
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400);
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radius = Math.min(width, height) / 2;
  const pie = d3.pie().sort(null);
  const arc = d3
    .arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 0.8);
  const arcs = pie([foudrePercent, humainPercent]);
  const color = d3.scaleOrdinal().range(["#ffe3b5", "#A4CFF3"]);
  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);
  const path = g
    .selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("fill", (d) => color(d.data))
    .attr("d", arc)
    .on("mouseover", function (event, d) {
      const percent = Math.round(d.data * 10) / 10;
      console.log(d);
      console.log(percent);
      tooltip
        .html(`${percent}%`)
        .transition()
        .duration(200)
        .style("opacity", 0.9);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Ajout d'un titre
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "1.5em")
    .attr("class", "texte-annee")
    .text(`${year}`);

  // Mise à jour de la variable "currentYear"
  currentYear = year;

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Ajout des événements de survol pour afficher le tooltip avec les pourcentages
}

// Appel initial de la fonction "createPieChart" avec l'année courante
createPieChart(currentYear);

// Ajout d'un bouton "Next" pour passer à l'année suivante
d3.select("body")
  .append("button")
  .text("Next")
  .attr("class", "next-button")
  .on("click", function () {
    currentYear++;
    if (currentYear > 2019) {
      currentYear = 1990;
    }
    createPieChart(currentYear);
    d3.select("svg").remove(); // Suppression du cercle de répartition précédent
    d3.select(".tooltip").remove();
  });
