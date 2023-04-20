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
import graph3Incendie from "../data/graph3_Nombres_incendies_par_provinces_et_années.json";
import graph3Superficie from "../data/graph3_Superficie_provinces.json";
import graph3Dommages from "../data/graph3_Valeur_dommages_par_pronvince_et_années.json";

/*################################### ---> GRAPH1 <--- ################################### */

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

/*test*/

/*################################### ---> GRAPH 3 <--- ################################### */

const annees = Object.keys(graph3Dommages[0]);

let nbrIncendies = [],
  valDommages = [],
  superficieProvinces = [],
  donnesCombinee = [];

const mergeByProvince = (a1, a2, a3, annee) => {
  let data = [];
  a1.map((itm) => {
    let newObject = {
      Juridiction: itm.Juridiction,
      Incendie: a3.find((item) => item.Juridiction === itm.Juridiction && item)[
        annee
      ],
      Dommage: a2.find((item) => item.Juridiction === itm.Juridiction && item)[
        annee
      ],
      Superficie: itm.km,
    };
    data.push(newObject);
  });
  return data;
};

annees.forEach((annee) => {
  superficieProvinces.push({ annee: annee, data: graph3Superficie });
  valDommages.push({ annee: annee, data: graph3Dommages });
  nbrIncendies.push({ annee: annee, data: graph3Incendie });

  const valDommagesAnnee = valDommages
    .filter((d) => d.annee == annee)
    .map((d) => d.data)[0];
  const superficieProvincesAnnee = superficieProvinces
    .filter((d) => d.annee == annee)
    .map((d) => d.data)[0];
  const nbreIncendieAnnee = nbrIncendies
    .filter((d) => d.annee == annee)
    .map((d) => d.data)[0];

  donnesCombinee.push({
    annee: annee,
    data: mergeByProvince(
      superficieProvincesAnnee,
      valDommagesAnnee,
      nbreIncendieAnnee,
      annee
    ),
  });
});

console.log(donnesCombinee);
//ICI OK

// Visualisation statique //
// Data 2019
const data2019 = donnesCombinee
  .filter((d) => d.annee == 2019)
  .map((d) => d.data)[0];

const margin = { top: 50, right: 40, bottom: 40, left: 40 };

const figure = select("body")
  .append("svg")
  .attr("id", "svg2")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const superficieProvincesScale = scaleSqrt()
  .domain([0, max(data2019.map((d) => d.Superficie))])
  .range([2, 30]);

const nbrIncendiesScale = scaleLinear()
  .domain([0, max(data2019.map((d) => d.Incendie))])
  .range([0, width]);

const valDommagesScale = scalePow()
  .domain([0, max(data2019.map((d) => d.Dommage))])
  .range([height, 0])
  .exponent(3);

figure
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(axisBottom(nbrIncendiesScale));

figure.append("g").call(axisLeft(valDommagesScale));

figure
  .append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height - 6)
  .text("nbrIncendies");

figure
  .append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 6)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("valDommages");

d3.select("body").append("button").text("play").attr("id", "play");

d3.select("body").append("button").text("pause").attr("id", "stop");

// Animation
// variable to store our intervalID
let nIntervId;

function animate() {
  // check if already an interval has been set up
  if (!nIntervId) {
    nIntervId = setInterval(play, 100);
  }
}

let i = 0;
const p = d3
  .select("body")
  .append("p")
  .attr("id", "paragraphe")
  .text(donnesCombinee[i].annee);

function play() {
  if (donnesCombinee[i].annee == 2019) {
    i = 0;
  } else {
    i++;
  }

  p.text(donnesCombinee[i].annee);
  updateChart(donnesCombinee[i].data);
}

function stop() {
  clearInterval(nIntervId);
  // release our intervalID from the variable
  nIntervId = null;
}

function updateChart(data_iteration) {
  figure
    .selectAll("circle")
    .data(data_iteration)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("cx", (d) => nbrIncendiesScale(d.Incendie))
          .attr("cy", (d) => valDommagesScale(d.Dommage))
          .attr("r", 0)
          .transition(transition().duration(500).ease(easeLinear))
          .attr("r", (d) => superficieProvincesScale(d.Superficie))
          .attr("fill", "rgba(0,0,0,.5)"),
      (update) =>
        update
          .transition(transition().duration(500).ease(easeLinear))
          .attr("cx", (d) => nbrIncendiesScale(d.Incendie))
          .attr("cy", (d) => valDommagesScale(d.Dommage))
          .attr("r", (d) => superficieProvincesScale(d.Superficie)),
      (exit) => exit.remove()
    );
}

document.getElementById("play").addEventListener("click", animate);
document.getElementById("stop").addEventListener("click", stop);
