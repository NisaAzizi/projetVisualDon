import * as d3 from "d3";
import { select, selectAll } from "d3-selection";
import { scaleSqrt, scaleLinear, scalePow } from "d3-scale";
import { max, min } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";
import { geoMercator, geoPath } from "d3-geo";
import { json } from "d3-fetch";
import { transition } from "d3-transition";
import { easeLinear } from "d3-ease";

import graph3Incendie from "../data/graph3_Nombres_incendies_par_provinces_et_années.json";
import graph3Superficie from "../data/graph3_Superficie_provinces.json";
import graph3Dommages from "../data/graph3_Valeur_dommages_par_pronvince_et_années.json";

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

d3.select("body").append("button").text("Play").attr("id", "play");

d3.select("body").append("button").text("Pause").attr("id", "stop");

// Animation
// variable to store our intervalID
let nIntervId;

function animate() {
  // check if already an interval has been set up
  if (!nIntervId) {
    nIntervId = setInterval(play, 1000);
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
