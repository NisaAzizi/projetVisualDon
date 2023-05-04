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
// Importation des données depuis un autre fichier JavaScript
// Fonction pour créer une jauge de répartition pour une année donnée
function createBarChart(year) {
  // Filtrage des données pour l'année spécifiée
  const filteredData = data.filter((d) => d.Annee === year);

  // Calcul du pourcentage de foudre et d'humain
  const total =
    filteredData[0]["Total Foudre"] + filteredData[0]["Total Humain"];
  const foudrePercent = (filteredData[0]["Total Foudre"] / total) * 100;
  const humainPercent = (filteredData[0]["Total Humain"] / total) * 100;

  // Définition des dimensions de la jauge
  const width = 400;
  const height = 200;

  // Création du conteneur SVG pour la jauge
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Définition des couleurs
  const colors = ["#ffe3b5", "#A4CFF3"];

  // Définition de l'échelle pour l'axe x
  const xScale = d3.scaleLinear().domain([0, total]).range([0, width]);

  // Définition de l'axe x
  const xAxis = d3
    .axisBottom(xScale)
    .tickSize(0)
    .tickFormat((d) => "");

  // Ajout de l'axe x
  svg
    .append("g")
    .attr("transform", `translate(0, ${height - 20})`)
    .call(xAxis)
    .selectAll("text")
    .remove();

  // Définition de l'échelle pour l'axe y
  const yScale = d3
    .scaleBand()
    .domain(["Foudre", "Humain"])
    .range([0, height - 20])
    .paddingInner(0.1);

  // Création des barres pour la jauge
  const bars = svg
    .selectAll(".bar")
    .data([foudrePercent, humainPercent])
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d, i) => yScale(i))
    .attr("width", (d) => xScale(d))
    .attr("height", yScale.bandwidth())
    .attr("fill", (d, i) => colors[i]);

  // Ajout d'un événement de survol pour les données de foudre
  bars
    .filter((d, i) => i === 0)
    .on("mouseover", function (event, d) {
      const percent = Math.round(d * 10) / 10;
      tooltip
        .html(
          "Foudre : ${percent}% de superficie brûlée total de l'année ${year} au Canada, soit ${filteredData[0][otal Foudre]}km2"
        )
        .transition()
        .duration(200)
        .style("opacity", 0.9);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Ajout d'un événement de survol pour les données humaines
  bars
    .filter((d, i) => i === 1)
    .on("mouseover", function (event, d) {
      const percent = Math.round(d * 10) / 10;
      tooltip
        .html(
          "Humain : ${percent}% de superficie brûlée total de l'année ${year} au Canada, soit ${filteredData[0][Total Humain]}km2"
        )
        .transition()
        .duration(200)
        .style("opacity", 0.9);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Ajout d'une légende pour la jauge
  const legend = svg
    .selectAll(".legend")
    .data(["Foudre", "Humain"])
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => translate(0, i * 20));

  legend
    .append("rect")
    .attr("x", width - 100)
    .attr("y", 5)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d, i) => colors[i]);

  legend
    .append("text")
    .attr("x", width - 80)
    .attr("y", 15)
    .text((d) => d)
    .style("font-size", "12px");

  // Ajout d'une infobulle pour afficher les détails des données survolées
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
}

// Appel initial de la fonction pour créer la jauge pour l'année courante
createBarChart(currentYear);
