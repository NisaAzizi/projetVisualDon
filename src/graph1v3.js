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

let currentYear = 1990;

//afficher currentYear
const textYear = d3
  .select("body")
  .append("p")
  .text(currentYear)
  .attr("class", "textYear");

// Créer un élément SVG dans le corps du document
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", 500)
  .attr("height", 250);

// Créer un rectangle de taille fixe
var rectFoudre = svg
  .append("rect")
  .attr("x", 50)
  .attr("y", 50)
  .attr("width", 800)
  .attr("height", 100)
  .attr("fill", "#ffe3b5");

//créer un rectangle dont la longueur change en fonction de la valeur de pourcentage de Humain
function createRectangle(year) {
  const filteredData = data.filter((d) => d.Annee === year);
  const total =
    filteredData[0]["Total Foudre"] + filteredData[0]["Total Humain"];
  const humainRatio = filteredData[0]["Total Humain"] / total;

  //creer un rectangle qui change de taille en fonction de la valeur de humainRatio
  var rectHumain = svg
    .append("rect")
    .attr("class", "rectHumain")
    .attr("x", 50)
    .attr("y", 50)
    .attr("width", 800 * humainRatio)
    .attr("height", 100)
    .attr("fill", "#A4CFF3")
    .on("mouseover", function () {
      svg
        .append("text")
        .attr("class", "textHumain")
        .attr("x", 50)
        .attr("y", 50)
        .attr("fill", "black")
        .text(`${filteredData[0]["Total Humain"]}km2`);
    })
    .on("mouseout", function () {
      svg.selectAll(".textHumain").remove();
    });
  rectFoudre
    .on("mouseover", function () {
      svg
        .append("text")
        .attr("x", 50)
        .attr("y", 50)
        .attr("fill", "black")
        .text("Foudre");
    })
    .on("mouseout", function () {
      svg.selectAll("text").remove();
    });
}

//quand on survole rectFoudre, on affiche un texte "foudre" qui s'efface quand  on sort du rectangle

//un bouton next qui permet de changer l'année courante et d'afficher cette année
createRectangle(currentYear);
const buttonNext = d3
  .select("body")
  .append("button")
  .text("Next")
  .attr("class", "next-button")
  .on("click", function () {
    if (currentYear <= 2018) {
      currentYear = currentYear + 1;
    } else {
      currentYear = 1990;
    }
    textYear.text(currentYear);
    svg.selectAll(".rectHumain").remove();
    createRectangle(currentYear);
  });
