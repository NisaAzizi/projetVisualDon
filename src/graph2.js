import DataGraph2 from "../data/graph2_Tortal_SuperficieBrulees_par_provinces_1990-2019.json";


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
    
        if(pourcentage.Juridiction == provinceName){
            if(pourcentage.pourcentage_CH != null){
                dataDeJuridiction = pourcentage.pourcentage_CH;
                referentiel="de la Suisse"
            }else{
                dataDeJuridiction = pourcentage.pourcentage_canton_GE;
                referentiel="du Canton de Genève"
            }
            
    }
}
    

    (sourceImg = province.querySelector("img")), (imgPath = "");
    provinceInfo.innerHTML = "";
    provinceInfo.insertAdjacentHTML(
      "afterbegin",
      "<img src=" +
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
  console.log(dataDeJuridiction)
});

