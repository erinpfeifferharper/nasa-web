const width = 800;
const height = 800;
let orbits = null; // Declare orbits with let
let networkMap = null;

const svg = d3.select("#orbit-map")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

// Add a tooltip element to the document
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const networkMapSvg = d3.select("#network-map")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

// Add event listener to the "Load Asteroids Art" button
const loadDataButton = document.getElementById("loadData");
loadDataButton.addEventListener("click", loadAsteroidsArt);

function loadAsteroidsArt() {
    const dateInput = document.getElementById('dateInput').value;
    const apiKey = "GoeMBuuZBNwxjErw8AJfbweuUpRIxqesP2PevTZu";
    const apiUrl = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}&date=${dateInput}`;

  // Fetch asteroid data for the selected date
  fetch(apiUrl)
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      const asteroids = data.near_earth_objects;
      if (orbits === null) {
          orbits = svg.append("g").attr("class", "orbits");
      }
      renderAsteroidOrbits(asteroids);
      renderNetworkMap(asteroids);
  })
  .catch(error => console.error("Error fetching data:", error.message));
}

function renderAsteroidOrbits(asteroids) {
    asteroids.sort((a, b) => {
        return a.close_approach_data[0].miss_distance.kilometers - b.close_approach_data[0].miss_distance.kilometers;
    });


    // Define a scale for mapping close approach distances to the size of the orbits
    const scale = d3.scaleLinear()
        .domain([0, d3.max(asteroids, d => d.close_approach_data[0].miss_distance.kilometers)])
        .range([10, width / 2]);

    const asteroidOrbits = orbits.selectAll("circle")
        .data(asteroids)
        .enter()
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", d => scale(d.close_approach_data[0].miss_distance.kilometers))
        .attr("fill", "none")
        .attr("stroke", (d, i) => {
            const interpolatedColor = i < asteroids.length / 2 ?
                d3.interpolateHsl('yellow', 'red')(i / (asteroids.length / 2)) :
                d3.interpolateHsl('red', 'blue')((i - asteroids.length / 2) / (asteroids.length / 2));
            return interpolatedColor;
        })
         // Assign different colors based on index
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", 4) // Adjust the stroke width here
        .on("mouseover", function (event, d) {
            // Display the tooltip with asteroid information
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(
                "Name: " + d.name + "<br>" +
                "Diameter: " + d.estimated_diameter.kilometers.estimated_diameter_max + " kilometers<br>" +
                "Distance from Earth: " + d.close_approach_data[0].miss_distance.kilometers + " kilometers"
            )
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            // Hide the tooltip when not hovering
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function renderNetworkMap(asteroids) {
    const links = [];
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            links.push({ source: i, target: j });
        }
    }

    const colorScale = d3.scaleOrdinal()
        .domain(asteroids.map((d, i) => i))
        .range(d3.schemeCategory10);

    const nodeAndLinkColor = (d, i) => {
        const interpolatedColor = i < asteroids.length / 2 ?
            d3.interpolateHsl('hsl(60, 100%, 80%)', 'hsl(0, 100%, 70%)')(i / (asteroids.length / 2)) :
            d3.interpolateHsl('hsl(0, 100%, 70%)', 'hsl(240, 100%, 70%)')((i - asteroids.length / 2) / (asteroids.length / 2));
        return interpolatedColor;
    };

    const simulation = d3.forceSimulation(asteroids)
        .force("link", d3.forceLink(links).distance(300))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = networkMapSvg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke-width", 1.7)
        .attr("stroke", (d, i) => nodeAndLinkColor(d, i));

    const node = networkMapSvg.selectAll(".node")
        .data(asteroids)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 14)
        .attr("fill", (d, i) => nodeAndLinkColor(d, i))
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(
                "Name: " + d.name + "<br>" +
                "Diameter: " + d.estimated_diameter.kilometers.estimated_diameter_max + " kilometers<br>" +
                "Distance from Earth: " + d.close_approach_data[0].miss_distance.kilometers + " kilometers"
            )
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

