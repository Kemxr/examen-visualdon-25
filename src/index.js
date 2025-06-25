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
   

    // 2.2 Les 10 cantons ayant la plus grande charge de passagers sur le réseau ferroviaire
 

    // 2.3 Représentativité des données

/*
========================================================================================================================
3. Visualisations (70 points)
========================================================================================================================
*/

    // --- 3.1 Carte choroplète ---
    // Affichez les cantons avec une couleur basée sur le nombre de passagers par 10'000 habitants

   




    // --- 3.2 Visualisation de la Charge de Passagers sur le Réseau Ferroviaire ---
    
    





    // --- 3.3 Diagramme en bâtons ---
    





    

});
