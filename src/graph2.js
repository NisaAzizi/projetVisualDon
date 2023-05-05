import DataGraph2 from "../data/graph2_Tortal_SuperficieBrulees_par_provinces_1990-2019.json";
import * as d3 from "d3";

//import geneve from "../data/geneve_points.geojson";

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
        } else {
          dataDeJuridiction = pourcentage.pourcentage_canton_GE;
          referentiel = "du Canton de Genève";
        }

        //Calcul du nombre de points à colorier
        let nbrePointsAColorier, pourcentageEnDessousDe100;
        //FAIRE ELSIF
        let CentPourcentSelonRefentiels = 1943;
        if(referentiel == "du Canton de Genève"){
          CentPourcentSelonRefentiels = 965;
        }

        console.log(dataDeJuridiction + " %");
        if (dataDeJuridiction >= 1 && dataDeJuridiction <= 100) {
          //affiche que suisse %
          nbrePointsAColorier = Math.round((CentPourcentSelonRefentiels * dataDeJuridiction) / 100);
          insertHtml(dataDeJuridiction, referentiel, provinceName);
          colorPoints(nbrePointsAColorier,0,referentiel);
        } else if (dataDeJuridiction >= 101 && dataDeJuridiction <= 200) {
          //affiche 1 suisse entière & %
          pourcentageEnDessousDe100 = dataDeJuridiction - 100;
          nbrePointsAColorier = Math.round( (CentPourcentSelonRefentiels * pourcentageEnDessousDe100) / 100);
          console.log(nbrePointsAColorier);
          insertHtml(dataDeJuridiction, referentiel, provinceName);
          colorPoints(CentPourcentSelonRefentiels, 1, referentiel);
          colorPoints(nbrePointsAColorier, 0, referentiel);
        } else if (dataDeJuridiction >= 201 && dataDeJuridiction <= 300) {
          //affiche 2x et %
          pourcentageEnDessousDe100 = dataDeJuridiction - 200;
          nbrePointsAColorier = Math.round((CentPourcentSelonRefentiels * pourcentageEnDessousDe100) / 100);
          insertHtml(dataDeJuridiction, referentiel, provinceName);
          colorPoints(CentPourcentSelonRefentiels, 2, referentiel);
          colorPoints(nbrePointsAColorier, 0, referentiel);
        } else if (dataDeJuridiction >= 301 && dataDeJuridiction <= 400) {
          //affiche 3x et %
          pourcentageEnDessousDe100 = dataDeJuridiction - 300;
          nbrePointsAColorier = Math.round((CentPourcentSelonRefentiels * pourcentageEnDessousDe100) / 100);
          insertHtml(dataDeJuridiction, referentiel, provinceName);
          colorPoints(CentPourcentSelonRefentiels, 3, referentiel);
          colorPoints(nbrePointsAColorier, 0, referentiel);
        } else if (dataDeJuridiction >= 401 && dataDeJuridiction <= 500) {
          //affiche 4x et
          pourcentageEnDessousDe100 = dataDeJuridiction - 400;
          nbrePointsAColorier = Math.round((CentPourcentSelonRefentiels * pourcentageEnDessousDe100) / 100);
          insertHtml(dataDeJuridiction, referentiel, provinceName);
          colorPoints(CentPourcentSelonRefentiels, 4, referentiel);
          colorPoints(nbrePointsAColorier,0, referentiel);
        }
      } else if (provinceName == "Nunavut") {
        dataDeJuridiction = 0;
        referentiel = "de la Suisse";
        insertHtml(dataDeJuridiction, referentiel, provinceName);
        
      }
    }

    provinceInfo.classList.add("show");
  }
  //console.log(dataDeJuridiction);
});

function colorPoints(numberOfPoints, nbre_de_svg, referentiel) {
  let geojsonACharger = "../data/switzerland_points.geojson";
  if(referentiel == "du Canton de Genève"){
    geojsonACharger = "../data/geneve_points.geojson";
  }
  d3.json(geojsonACharger).then(function (data) {
    let t = countPoints(data)
    console.log(t)
    let projection = d3.geoMercator().fitSize([width, height], data);
    let features = data.features.slice(0, numberOfPoints);

    //calcul du  %
    if (numberOfPoints != 1943) {
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
          return d3.hsl(0, 0, 0.26);
        });
    }

    //afficher la/les suisses 100%
    else {
      createSVGs(nbre_de_svg, features, projection);
    }
  });
}

function insertHtml(dataDeJuridiction, referentiel, provinceName) {
  provinceInfo.innerHTML = "";
  provinceInfo.insertAdjacentHTML(
    "afterbegin",
    "<div id='myDiv'></div><h1>" +
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

function createSVGs(nbre_de_svg, features, projection) {
  const container = d3.select("#myDiv");

  for (let i = 1; i <= nbre_de_svg; i++) {
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("id", `svg${i}`);

    svg
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
        return d3.hsl(0, 0, 0.26);
      });
  }
}

