import * as d3 from "d3";

import graphe1 from "../data/graph1_FoudreVsHuman.json"

// Dimensions du graphique
const width = 800;
const height = 400;

// Ajout du conteneur SVG
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


// Extraction des clés des données (à l'exception de la clé "Annee")
const keys = Object.keys(graphe1[0]).filter(key => key !== "Annee");

// Échelle X pour les années
const yScale = d3.scaleBand()
    .domain(graphe1.map(d => d.Annee))
    .range([0, height])
    .paddingInner(0.1);

const xScale = d3.scaleLinear()
    .domain([0, d3.max(graphe1, d => d3.sum(keys, key => d[key]))])
    .range([0, width]);

// Échelle de couleur pour les données
const colorScale = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

// Création du groupe pour l'histogramme empilé
const stackGroup = svg.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(graphe1))
    .join("g")
    .attr("fill", d => colorScale(d.key));


let bars = stackGroup.selectAll("rect")
    .data(d => d.filter(item => item.data.Annee === graphe1[0].Annee))
    .join("rect")
    .attr("y", height/2)
    .attr("x", d => xScale(d.Annee))
    .attr("width", d => xScale(d[1]) - xScale(d[0]))
    .attr("height", yScale.bandwidth());

const currentYearText = svg.append("text")
    .attr("x", 40)
    .attr("y", 300)
    .attr("text-anchor", "end")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text(`${graphe1[0].Annee}`);

d3.select("body")
    .append("button")
    .text("Suivant")
    .on("click", () => {
        let currentYear = parseInt(bars.data()[0].data.Annee);
        let currentIndex = graphe1.findIndex(d => d.Annee === currentYear);
        if (currentIndex === graphe1.length - 1) {
            currentIndex = -1;
        }
        let nextData = graphe1[currentIndex + 1];
        currentYearText.text(`${nextData.Annee}`);
        bars = stackGroup.selectAll("rect")
            .data(d => d.filter(item => item.data.Annee === nextData.Annee))
            .join(
                enter => enter.append("rect")
                    .attr("y",  height/2)
                    .attr("height", yScale.bandwidth())
                    .attr("fill", d => colorScale(d.key))
                    .attr("x", d => xScale(d[0]))
                    .attr("width", 0)
                    .call(enter => enter.transition()
                        .duration(500)
                        .attr("width", d => xScale(d[1]) - xScale(d[0]))),
                update => update
                    .attr("y", height/2)
                    .attr("x", d => xScale(d[0]))
                    .attr("width", d => xScale(d[1]) - xScale(d[0]))
                    .call(update => update.transition()
                        .duration(500)
                        .attr("width", d => xScale(d[1]) - xScale(d[0]))),
                exit => exit
                    .call(exit => exit.transition()
                        .duration(500)
                        .attr("width", 0)
                        .remove())
            )});


const xAxis = d3.axisBottom(xScale);
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

const yAxis = d3.axisLeft(yScale);
svg.append("g")
    .call(yAxis);


