import * as d3 from "d3";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import "./style.css";  // Si vous avez besoin de styles CSS spécifiques

/*
========================================================================================================================
1. Dessin SVG (15 points)
========================================================================================================================
Vous pouvez dessiner la figure soit à partir d'ici ou directement dans l'HTML (index.html).
*/
// 1. paramètres de base
const width = 600;
const height = 600;
const svg = d3
  .select("body")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
    // origine centrée
    .attr("viewBox", "-300 -300 600 600");

// 2. points de l’hexagone régulier (rayon 200)
const hexagon = [
  [   0, -200],  // sommet top
  [173.2, -100], // haut droite
  [173.2,  100], // bas droite
  [   0,  200],  // sommet bottom corrigé
  [-173.2, 100], // bas gauche
  [-173.2,-100]  // haut gauche
];

// 3. tracé de l’hexagone
svg.append("polygon")
  .attr("points", hexagon.map(d => d.join(",")).join(" "))
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 3);

// 4. carrés latéraux (taille 100), bord intérieur flush avec l’hexagone
const squareSize = 100;  
const r = squareSize / 2;
const midSides = [
  [-173.2 - r, -50],  
  [ 173.2 + r, -50]
];

midSides.forEach(([cx, cy]) => {
  const pts = [
    [cx - r, cy - r],
    [cx + r, cy - r],
    [cx + r, cy + r],
    [cx - r, cy + r]
  ];
  svg.append("polygon")
    .attr("points", pts.map(d => d.join(",")).join(" "))
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 3);
});

// 5. lignes rouges intérieures (du centre vers 3 sommets)
const center = [0, 0];
const targets = [
  [   0, -200],  // top
  [173.2,  100], // bas droite
  [-173.2, 100]  // bas gauche
];

svg.selectAll(".radial")
  .data(targets)
  .enter()
  .append("line")
    .attr("x1", center[0]).attr("y1", center[1])
    .attr("x2", d => d[0]).attr("y2", d => d[1])
    .attr("stroke", "red")
    .attr("stroke-width", 3);

// 6. segment noir horizontal à l’intérieur (à y = 50px)
svg.append("line")
  .attr("x1", -86).attr("y1",  50)
  .attr("x2",  86).attr("y2",  50)
  .attr("stroke", "black")
  .attr("stroke-width", 3);





/*
========================================================================================================================
2. Manipulation des données (15 points)
========================================================================================================================
*/

const dataCantons = "../data/cantons_average_daily_trafic.geojson";
const dataNetwork = "../data/network_average_daily_trafic.geojson";

Promise.all([
    d3.json(dataCantons),
    d3.json(dataNetwork)
]).then(([cantons, network]) => {
     
     console.log('Données des cantons :', cantons);
     console.log('Données du réseau ferroviaire :', network);

    // 2.1 Le canton ayant la plus grande charge de passagers sur le réseau ferroviaire
    const cantonFeatures = cantons.features;
    const cantonMax = d3.max(cantonFeatures, d => d.properties.avg_daily_trafic);
    const cantonMaxObj = cantonFeatures.find(d => d.properties.avg_daily_trafic === cantonMax);
    if (cantonMaxObj) {
        console.log('Canton avec la plus grande charge :', {
            name: cantonMaxObj.properties.name,
            avg_daily_trafic: cantonMaxObj.properties.avg_daily_trafic
        });
    }

    // 2.2 Les 10 cantons ayant la plus grande charge de passagers sur le réseau ferroviaire
    const top10 = cantonFeatures
        .slice() // copie pour ne pas muter l'original
        .sort((a, b) => b.properties.avg_daily_trafic - a.properties.avg_daily_trafic)
        .slice(0, 10)
        .map(d => ({
            name: d.properties.name,
            avg_daily_trafic: d.properties.avg_daily_trafic
        }));
    console.log('Top 10 cantons par charge :', top10);

    // 2.3 Représentativité des données
    console.log('Commentaire : La charge absolue ne suffit pas pour comparer les cantons. ' +
        'Il serait pertinent de rapporter la charge à la population ou à la longueur du réseau, ' +
        'et de prendre en compte d\'autres facteurs comme la densité de population.');
/*
========================================================================================================================
3. Visualisations (70 points)
========================================================================================================================
*/

    // --- 3.1 Carte choroplète ---
    // Affichez les cantons avec une couleur basée sur le nombre de passagers par 10'000 habitants
    const map = L.map('map').setView([46.8, 8.3], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const ratios = cantonFeatures.map(d => (d.properties.avg_daily_trafic / d.properties.population) * 10000);
    const color = d3.scaleSequential(d3.interpolateBlues)
        .domain([d3.min(ratios), d3.max(ratios)]);

    function style(feature) {
        const ratio = (feature.properties.avg_daily_trafic / feature.properties.population) * 10000;
        return {
            fillColor: color(ratio),
            weight: 1,
            color: '#333',
            fillOpacity: 0.7
        };
    }

    let geojson;
    function onEachFeature(feature, layer) {
        const ratio = (feature.properties.avg_daily_trafic / feature.properties.population) * 10000;
        layer.bindTooltip(`<strong>${feature.properties.name}</strong><br>${ratio.toFixed(0)} passagers / 10'000 habitants`);
        layer.on({
            mouseover: (e) => e.target.setStyle({ weight: 3 }),
            mouseout: (e) => geojson.resetStyle(e.target)
        });
    }

    geojson = L.geoJSON(cantons, { style, onEachFeature }).addTo(map);

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        const grades = color.ticks(5);
        div.innerHTML += "<h4>Passagers / 10'000 hab.</h4>";
        for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];
            div.innerHTML += '<i style="background:' + color(from + 0.0001) + ';width:18px;height:18px;display:inline-block;margin-right:8px;"></i> ' +
                from.toFixed(0) + (to ? '&ndash;' + to.toFixed(0) + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);
   




    // --- 3.2 Visualisation de la Charge de Passagers sur le Réseau Ferroviaire ---
    
    





    // --- 3.3 Diagramme en bâtons ---
    





    

});
