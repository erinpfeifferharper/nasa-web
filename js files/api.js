const btnLoad = document.getElementById("loadData");
const outputDiv = document.getElementById("output");
const API_KEY = "GoeMBuuZBNwxjErw8AJfbweuUpRIxqesP2PevTZu";  

btnLoad.addEventListener("click", loadAsteroidsData);

async function loadAsteroidsData() {
    const dateInput = document.getElementById('dateInput').value;
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateInput}&end_date=${dateInput}&api_key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        displayData(data);

    } catch (error) {
        console.error("Error fetching data:", error);
        outputDiv.innerHTML = "Failed to fetch data. Please try again.";
    }
}

function displayData(data) {
    const asteroids = data.near_earth_objects;
    let htmlContent = "";
    let diameterData = [];
    let distanceData = [];
    let asteroidNames = [];

    for (let date in asteroids) {
        htmlContent += `<h3>${date}</h3><ul>`;
        asteroids[date].forEach(asteroid => {
            let avgDiameter = (asteroid.estimated_diameter.meters.estimated_diameter_min + asteroid.estimated_diameter.meters.estimated_diameter_max) / 2;
            let distance = asteroid.close_approach_data[0].miss_distance.kilometers * 0.000001;
            htmlContent += `<li>Name: ${asteroid.name} <br> Diameter: ${avgDiameter.toFixed(2)} meters <br> Distance from Earth: ${parseFloat(distance).toFixed(2)} Megameters</li>`;
            diameterData.push(avgDiameter);
            distanceData.push(parseFloat(distance));
            asteroidNames.push(asteroid.name);
        });
        htmlContent += '</ul>';
    }

    outputDiv.innerHTML = htmlContent;
    d3.select('#diameterChart').selectAll("*").remove();
    d3.select('#distanceChart').selectAll("*").remove();
    d3.select('#bubbleChart').selectAll("*").remove(); // Remove existing content

    console.log("Diameter Data:", diameterData);
    console.log("Distance Data:", distanceData);
    console.log("Asteroid Names:", asteroidNames);

    createBarChart('#diameterChart', diameterData, 'Asteroid Diameter in meters', 'Asteroid Name');
    createScatterChart('#distanceChart', distanceData, 'Distance from Earth in Megameters', 'Asteroid Name');
    createBubbleChart('#bubbleChart', diameterData, distanceData, asteroidNames); // Create the bubble chart
}

function createBarChart(selector, data, label, labelX) {
    const margin = {top: 20, right: 80, bottom: 40, left: 50};
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(selector)
                  .append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map((d, i) => i)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height, 0]);

    // Create a tooltip
    const tooltip = d3.select('body').append('div')
                      .style('position', 'absolute')
                      .style('background', '#f9f9f9')
                      .style('padding', '5px')
                      .style('border', '1px solid #ccc')
                      .style('border-radius', '5px')
                      .style('opacity', '0');


    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -5) 
        .attr('text-anchor', 'middle')
        .style('font-weight', 'light')
        .text('Asteroid Diameter Chart');

    svg.append('g')
       .selectAll('.bar')
       .data(data)
       .enter().append('rect')
       .attr('class', 'bar')
       .attr('x', (d, i) => x(i))
       .attr('y', d => y(d))
       .attr('width', x.bandwidth())
       .attr('height', d => height - y(d))
       .style('fill', 'palevioletred')
       .on('mouseover', (event, d) => {
           tooltip.transition()
                  .duration(200)
                  .style('opacity', .9);
           tooltip.html("Value: " + d.toFixed(2))
                  .style('left', (event.pageX) + 'px')
                  .style('top', (event.pageY - 28) + 'px');
       })
       .on('mouseout', (d) => {
           tooltip.transition()
                  .duration(500)
                  .style('opacity', 0);
       });

    svg.append('g')
       .attr('class', 'x-axis')
       .attr('transform', `translate(0,${height})`)
       .call(d3.axisBottom(x))
       .append('text')
       .attr('fill', '#000')
       .attr('transform', 'rotate(0)')
       .attr('x', 450 )
       .attr('dy', 40)
       .attr('text-anchor', 'end')
       .text(labelX);

    svg.append('g')
       .attr('class', 'y-axis')
       .call(d3.axisLeft(y).ticks(5))
       .append('text')
       .attr('fill', '#000')
       .attr('transform', 'rotate(-90)')
       .attr('y', -40)
       .attr('dy', 0)
       .attr('text-anchor', 'end')
       .text(label);
}

function createScatterChart(selector, data, label, labelX) {
    const margin = {top: 20, right: 80, bottom: 40, left: 50};
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(selector)
                  .append('svg')
                  .attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map((d, i) => i)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height, 0]);

    // Create a tooltip
    const tooltip = d3.select('body').append('div')
                      .style('position', 'absolute')
                      .style('background', '#f9f9f9')
                      .style('padding', '5px')
                      .style('border', '1px solid #ccc')
                      .style('border-radius', '5px')
                      .style('opacity', '0');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -5) 
        .attr('text-anchor', 'middle')
        .style('font-weight', 'light')
        .text('Distance from Earth Chart');
    
    svg.append('g')
       .selectAll('.dot')
       .data(data)
       .enter()
       .append('circle')      
       .attr('class', 'dot')  
       .attr('cx', (d, htmlContent) => x(htmlContent) + x.bandwidth() / 2)  
       .attr('cy', d => y(d)) 
       .attr('r', 5)
       .style('fill', 'plum')
       .on('mouseover', (event, d) => {
           tooltip.transition()
                  .duration(200)
                  .style('opacity', .9);
           tooltip.html("Value: " + d.toFixed(2))
                  .style('left', (event.pageX) + 'px')
                  .style('top', (event.pageY - 28) + 'px');
       })
       .on('mouseout', (d) => {
           tooltip.transition()
                  .duration(500)
                  .style('opacity', 0);
       });

    svg.append('g')
       .attr('class', 'x-axis')
       .attr('transform', `translate(0,${height})`)
       .call(d3.axisBottom(x))
       .append('text')
       .attr('fill', '#000')
       .attr('transform', 'rotate(0)')
       .attr('x', 450 )
       .attr('dy', 40)
       .attr('text-anchor', 'end')
       .text(labelX);

    svg.append('g')
       .attr('class', 'y-axis')
       .call(d3.axisLeft(y).ticks(5))
       .append('text')
       .attr('fill', '#000')
       .attr('transform', 'rotate(-90)')
       .attr('y', -40)
       .attr('dy', 0)
       .attr('text-anchor', 'end')
       .text(label);
}

function createBubbleChart(selector, diameterData, distanceData, asteroidNames) {
    const margin = { top: 20, right: 80, bottom: 40, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(selector)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxDiameter = d3.max(diameterData);
    const maxDistance = d3.max(distanceData);

    const x = d3.scaleLinear().domain([0, maxDiameter]).nice().range([0, width]);
    const y = d3.scaleLinear().domain([0, maxDistance]).nice().range([height, 0]);
    const radius = d3.scaleSqrt().domain([0, maxDiameter]).range([2, 20]);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'light')
        .text('Distance from Earth Vs. Asteroid Diameter Chart');

    // Create a tooltip div
    const tooltip = d3.select(selector)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg
        .selectAll('.bubble')
        .data(diameterData)
        .enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('cx', (d) => x(d))
        .attr('cy', (d, i) => y(distanceData[i]))
        .attr('r', (d) => radius(d))
        .style('fill', 'skyblue')
        // Add the hover interaction
        .on("mouseover", function (event, d) {
            diameterData.forEach(function (value, index) {
                if (value === d) {
                    // Display the tooltip with the data at the captured index
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(
                        "Name: " + asteroidNames[index] + "<br>" +
                        "Diameter: " + diameterData[index] + " meters<br>" +
                        "Distance from Earth: " + distanceData[index] + " Megameters"
                    )
                    .style("left", (d3.pointer(event)[0] + 5) + "px")
                    .style("top", (d3.pointer(event)[1] - 28) + "px"); // Use d3.pointer to get the y-coordinate
        }
    });
})
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('fill', '#000')
        .attr('x', 450)
        .attr('dy', 40)
        .attr('text-anchor', 'end')
        .text('Asteroid Diameter in meters');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', 0)
        .attr('text-anchor', 'end')
        .text('Distance from Earth in Megameters');
}

// Usage
const diameterData = [100, 200, 300, 400];
const distanceData = [10, 20, 30, 40];
const asteroidNames = ["Asteroid A", "Asteroid B", "Asteroid C", "Asteroid D"];

createBubbleChart("#chart-container", diameterData, distanceData, asteroidNames);
