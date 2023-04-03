import * as d3 from "d3";

import graphe1 from "../data/graph1_FoudreVsHuman.json"

console.log(graphe1)
//Graph2
// Définir les dimensions du graphique
const width = 600;
const height = 400;
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Créer l'élément SVG et l'ajouter au DOM
const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Créer un groupe pour les éléments du graphique
const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Définir les échelles pour les axes X et Y
const x = d3.scaleBand().range([0, innerWidth]).padding(0.1);
const y = d3.scaleLinear().range([innerHeight, 0]);

// Créer les axes X et Y
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y).ticks(5);

// Définir les couleurs des différentes séries de données
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Charger les données à partir du JSON
d3.json(graphe1).then(function (data) {
    // Convertir les données en un format adapté pour la méthode d3.stack()
    const series = d3.stack().keys(["Total Foudre", "Total Humain"])(data);

    // Définir les domaines des échelles en fonction des données
    x.domain(data.map((d) => d.Annee));
    y.domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))]);

    // Dessiner les éléments du graphique
    g.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

    g.append("g").attr("class", "axis axis-y").call(yAxis);

    const serie = g
        .selectAll(".serie")
        .data(series)
        .enter()
        .append("g")
        .attr("class", "serie")
        .attr("fill", (d) => color(d.key));

    serie
        .selectAll("rect")
        .data((d) => d)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.data.Année))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

});
