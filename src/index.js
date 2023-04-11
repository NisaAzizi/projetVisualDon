import * as d3 from "d3";

import graphe1 from "../data/graph1_FoudreVsHuman.json"
import graph3Incendie from "../data/graph3_Nombres_incendies_par_provinces_et_années.json"
import graph3Superficie from "../data/graph3_Superficie_provinces.json"
import graph3Dommages from "../data/graph3_Valeur_dommages_par_pronvince_et_années.json"


/*################################### ---> GRAPH1 <--- ################################### */

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


let bars = stackGroup.selectAll("g")
    .data(d => d.filter(item => item.data.Annee === graphe1[0].Annee))
    .join("g")
    .attr("class", "bar-group");

bars.append("rect")
    .attr("y", height/2)
    .attr("x", d => xScale(d.Annee))
    .attr("width", d => xScale(d[1]) - xScale(d[0]))
    .attr("height", yScale.bandwidth())
    .attr("class", "bar")
    .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px")
            .html(`<div>
                        <span style="display:inline-block;width:10px;height:10px;background-color:steelblue;margin-right:5px;"></span>
                        Total Foudre: ${d.data["Total Foudre"]}
                    </div>
                    <div>
                        <span style="display:inline-block;width:10px;height:10px;background-color:darkorange;margin-right:5px;"></span>
                        Total Humain: ${d.data["Total Humain"]}
                    </div>`);
    })
    .on("mouseout", function (event, d) {
        tooltip.style("opacity", 0);
    });


const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");


const currentYearText = svg.append("text")
    .attr("x", 40)
    .attr("y", 300)
    .attr("text-anchor", "end")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text(`${graphe1[0].Annee}`);


//https://codepen.io/romanoe/pen/rNZKjvB Pour automatiser l'avancement des dates
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

//Supprimer les axes
const xAxis = d3.axisBottom(xScale);
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

const yAxis = d3.axisLeft(yScale);
svg.append("g")
    .call(yAxis);


/*################################### ---> GRAPH 3 <--- ################################### */

const annees = Object.keys(graph3Dommages[0])

let nbrIncendies = [],
    valDommages = [],
    superficieProvinces = [],

    donnesCombinee = [];

const mergeByProvince = (a1, a2, a3) => {
  let data = [];
  a1.map(itm => {
    let newObject = {
      "Juridiction": itm.Juridiction,
      "incendies": a3.find((item) => item.Juridiction === itm.Juridiction).nombre,
      "coût des dommages": a2.find((item) => item.Juridiction === itm.Juridiction).valeur,
      "superficie": itm.superficie
    };
    data.push(newObject);
  });
  return data;
};

annees.forEach(annee => {
  valDommages.push({"annee":annee, "data" : graph3Dommages})
  superficieProvinces.push({"annee":annee, "data" :graph3Superficie})
  nbrIncendies.push({"annee":annee, "data" : graph3Incendie})

  const valDommagesAnnee = valDommages.filter(d => d.annee == annee).map(d => d.data)[0];
  const superficieProvincesAnnee = superficieProvinces.filter(d => d.annee == annee).map(d => d.data)[0];
  const nbreIncendieAnnee = nbrIncendies.filter(d => d.annee == annee).map(d => d.data)[0];

  donnesCombinee.push({"annee": annee, "data": mergeByProvince(valDommagesAnnee, superficieProvincesAnnee, nbreIncendieAnnee)})
});

console.log(donnesCombinee);
//ICI OK


