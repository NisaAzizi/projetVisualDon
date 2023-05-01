import DataGraph2 from "../data/graph2_Tortal_SuperficieBrulees_par_provinces_1990-2019.json";
import * as d3 from "d3";

const margin = { top: 10, right: 20, bottom: 30, left: 20 },
  width = 300 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

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
    (sourceImg = province.querySelector("img")), (imgPath = "");


    for (const pourcentage of DataGraph2) {
      if (pourcentage.Juridiction == provinceName) {
        if (pourcentage.pourcentage_CH != null) {
          dataDeJuridiction = pourcentage.pourcentage_CH;
          referentiel = "de la Suisse";

          //Calcul du nombre de points à colorier
          let nbrePointsAColorier, pourcentageEnDessousDe100;
          //FAIRE ELSIF

          if (dataDeJuridiction >= 1 && dataDeJuridiction <= 100) {
            //affiche 1x la swiss
            nbrePointsAColorier = Math.round((1943 * dataDeJuridiction) / 100);
            insertHtml(dataDeJuridiction, referentiel,provinceName, imgPath, sourceImg);
            colorPoints(nbrePointsAColorier);

          } else if (dataDeJuridiction >= 101 && dataDeJuridiction <= 200) {
            //affiche 2x la swiss
            pourcentageEnDessousDe100 = dataDeJuridiction - 100;
            nbrePointsAColorier = Math.round((1943 * pourcentageEnDessousDe100) / 100);
            insertHtml(dataDeJuridiction, referentiel,provinceName, imgPath, sourceImg);
            colorPoints(1947);

          } else if (dataDeJuridiction >= 201 && dataDeJuridiction <= 300) {
            //affiche 3x la swiss
            pourcentageEnDessousDe100 = dataDeJuridiction - 200;
            nbrePointsAColorier = Math.round((1943 * pourcentageEnDessousDe100) / 100);
            //+afficher 2x la suisse en entier
            insertHtml(dataDeJuridiction, referentiel,provinceName, imgPath, sourceImg);
            colorPoints(nbrePointsAColorier);
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


    provinceInfo.classList.add("show");
  }
  console.log(dataDeJuridiction);
});

function colorPoints(numberOfPoints) {
  console.log("here")
  d3.json("../data/switzerland_points.geojson").then(function (data) {
    let projection = d3.geoMercator().fitSize([width, height], data);
    let features = data.features.slice(0, numberOfPoints);
    
// Ajouter le svg
const monSvg = d3
.select("#myDiv")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    monSvg
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
      .attr("r", 1.5)
      .style("fill", function (d) {
        return d3.hsl(36, 1, 0.7);
      });
  });
}



function insertHtml (dataDeJuridiction, referentiel, provinceName, imgPath, sourceImg) {

  provinceInfo.innerHTML = "";
  provinceInfo.insertAdjacentHTML(
    "afterbegin",
    "<div id='myDiv'></div><img src=" +
      imgPath +
      sourceImg.getAttribute("xlink:href") +
      " alt='" +
      sourceImg.getAttribute("alt") +
      "'><h1>" +
      provinceName +
      `</h1><p> La superficie brûlée en juridiction ${provinceName} entre 
      1990 et 2019 représente <b> ${dataDeJuridiction} % <b> de la superficie ${referentiel} </p>`
  );

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
