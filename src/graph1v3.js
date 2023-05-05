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
  .attr("width", 1000)
  .attr("height", 250);

// Créer un rectangle de taille fixe
var rectFoudre = svg
  .append("rect")
  .attr("x", 0)
  .attr("y", 50)
  .attr("width", 1000)
  .attr("height", 100)
  .attr("fill", "#ffe3b5");

var imgFoudre = svg
  .append("svg:image")
  .attr("xlink:href", "../img/iconeFoudre.svg")
  .attr("x", 950)
  .attr("y", 0)
  .attr("width", 50)
  .attr("height", 50);
var imgHumain = svg
  .append("svg:image")
  .attr("xlink:href", "../img/iconeHumain.svg")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 50)
  .attr("height", 50);
//créer un rectangle dont la longueur change en fonction de la valeur de pourcentage de Humain
function createRectangle(year) {
  const filteredData = data.filter((d) => d.Annee === year);
  const total =
    filteredData[0]["Total Foudre"] + filteredData[0]["Total Humain"];
  const humainRatio = filteredData[0]["Total Humain"] / total;
  const humainPercentage = Math.round(humainRatio * 100);
  const foudrePercentage = 100 - humainPercentage;
  //add images that are in the img folder above the rectangles

  //creer un rectangle qui change de taille en fonction de la valeur de humainRatio
  var rectHumain = svg
    .append("rect")
    .attr("class", "rectHumain")
    .attr("x", 0)
    .attr("y", 50)
    .attr("width", 1000 * humainRatio)
    .attr("height", 100)
    .attr("fill", "#A4CFF3")
    .on("mouseover", function () {
      svg
        .append("text")
        .attr("class", "textHumain")
        .attr("x", 430)
        .attr("y", 200)
        .attr("position", "center")
        .attr("fill", "black")
        .text(
          `${humainPercentage}% soit ${filteredData[0]["Total Humain"]}km2`
        );
      svg
        .append("rect")
        .attr("x", 410)
        .attr("y", 190)
        .attr("class", "square")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#A4CFF3");
    })
    .on("mouseout", function () {
      svg.selectAll(".textHumain").remove();
      svg.selectAll(".square").remove();
    });
  rectFoudre
    .on("mouseover", function () {
      svg
        .append("text")
        .attr("x", 430)
        .attr("y", 200)
        .attr("class", "textFoudre")
        .attr("fill", "black")
        .attr("position", "center")
        .text(`${foudrePercentage}% soit ${filteredData[0]["Total Foudre"]}km2`)
        .append("square");
      svg
        .append("rect")
        .attr("x", 410)
        .attr("y", 190)
        .attr("class", "square")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#ffe3b5");
    })
    .on("mouseout", function () {
      svg.selectAll(".textFoudre").remove();
      svg.selectAll(".square").remove();
    });
}

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

// Create a dropdown menu for selecting the year
const selectYear = d3
  .select("body")
  .append("select")
  .attr("class", "select-year")
  .on("change", function () {
    currentYear = +this.value;
    textYear.text(currentYear);
    svg.selectAll(".rectHumain").remove();
    createRectangle(currentYear);
  });

// Populate the dropdown menu with options for each year in the dataset
const years = data.map((d) => d.Annee);
selectYear
  .selectAll("option")
  .data(years)
  .enter()
  .append("option")
  .attr("value", (d) => d)
  .text((d) => d);

// Function to fade out the current rectangle and fade in the new one
function fadeRectangles(year) {
  svg
    .selectAll(".rectHumain")
    .transition()
    .duration(500)
    .attr("opacity", 0)
    .remove();

  createRectangle(year);

  svg
    .selectAll(".rectHumain")
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .attr("opacity", 1);
}

// Change the year every 5 seconds with a fade effect
setInterval(() => {
  if (currentYear >= 2018) {
    currentYear = 1990;
  } else {
    currentYear++;
  }
  textYear.text(currentYear);
  fadeRectangles(currentYear);
}, 5000);
