import DataGraph2 from "../data/graph2_Tortal_SuperficieBrulees_par_provinces_1990-2019.json";
import * as d3 from "d3";

const width = 1500;
const height = 300;

let canadamap = document.getElementById("canada-map"),
  provinceInfo = document.getElementById("provinceInfo"),
  allProvinces = canadamap.querySelectorAll("g");
canadamap.addEventListener("click", function (e) {
  let dataDeJuridiction;
  let referentiel;
  let province = e.target.parentNode;
  if (e.target.nodeName == "path") {
    for (let i = 0; i < allProvinces.length; i++) {
      allProvinces[i].classList.remove("active");
    }
    province.classList.add("active");
    let provinceName = province.querySelector("title").innerHTML;
    let sourceImg, imgPath;

    for (const pourcentage of DataGraph2) {
      if (pourcentage.Juridiction == provinceName) {
        if (pourcentage.pourcentage_CH != null) {
          dataDeJuridiction = pourcentage.pourcentage_CH;
          referentiel = "de la Suisse";

          //Calcul du nombre de points à colorier
          let nbrePointsAColorier, pourcentageEnDessousDe100;
          console.log(dataDeJuridiction >= 101 && dataDeJuridiction <= 200)
          //Switch case si dataDeJuridiction est entre 1 et 100, 101 et 200, 201 et 300, etc.
          switch (true) {
            case (dataDeJuridiction >= 1 && dataDeJuridiction <= 100): //affiche 1x la swiss
            nbrePointsAColorier = Math.round((1943 * dataDeJuridiction) / 100);
              colorPoints(nbrePointsAColorier);
              break;

            case (dataDeJuridiction >= 101 && dataDeJuridiction <= 200): //affiche 2x la swiss
              pourcentageEnDessousDe100 = dataDeJuridiction - 100;
              nbrePointsAColorier = Math.round((1943 * pourcentageEnDessousDe100) / 100);
              //+afficher 1 la suisse en entier
              //ajouter un nouvel svg dans le div id=addSvgSwiss
              d3.select('#addSvgSwiss')
              .append('svg')
              .attr('id', 'swiss2')
              .attr("width", 500)
              .attr("height", 500);
              colorPoints(nbrePointsAColorier);
              break;

            case (dataDeJuridiction >= 201 && dataDeJuridiction <= 300): //affiche 3x la swiss
              pourcentageEnDessousDe100 = dataDeJuridiction - 200;
              nbrePointsAColorier = Math.round((1943 * pourcentageEnDessousDe100) / 100);
              //+afficher 2x la suisse en entier
              colorPoints(nbrePointsAColorier);
              break;
          }
        } else {
          dataDeJuridiction = pourcentage.pourcentage_canton_GE;
          referentiel = "du Canton de Genève";
        }
      } else if (provinceName == "Nunavut") {
        dataDeJuridiction = 0;
        referentiel = "de la Suisse";
      }
    }

    (sourceImg = province.querySelector("img")), (imgPath = "");
    provinceInfo.innerHTML = "";
    provinceInfo.insertAdjacentHTML(
      "afterbegin",
      "<div id='addSvgSwiss'><svg id='swiss'></svg></div><img src=" +
        imgPath +
        sourceImg.getAttribute("xlink:href") +
        " alt='" +
        sourceImg.getAttribute("alt") +
        "'><h1>" +
        provinceName +
        `</h1><p> La superficie brûlée en juridiction ${provinceName} entre 
        1990 et 2019 représente <b> ${dataDeJuridiction} % <b> de la superficie ${referentiel} </p>`
    );
    provinceInfo.classList.add("show");
  }
  console.log(dataDeJuridiction);
});

function colorPoints(numberOfPoints) {
  d3.json("../data/switzerland_points.geojson").then(function (data) {
    //let pt = countPoints(data);
    //console.log(pt);
    var features = data.features.slice(0, numberOfPoints);
    var projection = d3.geoMercator().fitSize([width, height], data);
    var colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, features.length]);
    d3.select("#swiss")
      .selectAll("circle")
      .data(features)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection(d.geometry.coordinates)[0];
      })
      .attr("cy", function (d) {
        return projection(d.geometry.coordinates)[1];
      })
      .attr("r", 5)
      .style("fill", function (d) {
        return d3.hsl(36, 1, 0.7);
      });
    //.style("fill", function(d, i) { return colorScale(i); });
  });
}

//total de pts = 1943 = 100%
function countPoints(geojson) {
  let features = geojson.features;
  let count = 0;
  for (let i = 0; i < features.length; i++) {
    if (features[i].geometry.type === "Point") {
      count++;
    }
  }
  return count;
}
