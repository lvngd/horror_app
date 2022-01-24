const height = window.innerHeight
const width = window.innerWidth
const radius = 4
const step = radius * 2
const theta = Math.PI * (3 - Math.sqrt(5))

d3.json('js/results.json')
    .then(data => {
        createChart(data, width, height, radius, step, theta)
    })

function createChart(d, width, height, radius, step, theta) {

    //top margin is at least the radius 
    //just to make sure circles are completely visible
    const margin = {top: radius, bottom: 10, left: width/10, right: width/10}

    const gridWidth = width - margin.left - margin.right;

    let m = d.map((item, i) => {
        const radius = step * Math.sqrt(i += 0.5);
        const a = theta * i;
        const x = width / 2 + radius * Math.cos(a);
        const y = height / 2 + radius * Math.sin(a);
        const parsedDate = new Date(item.date);
        let obj = {
            id: Math.floor(i),
            title: item.title,
            chapter: item.chapter,
            date: parsedDate,
            type: item.type,
            overview: item.overview,
            poster: item.poster,
            genre: item.genre[0],
            language: item.language,
            x: x,
            y: y
        }
        return obj
    })

    let uniqueYears = new Set(m.map(d => d.date.getFullYear()));
            uniqueYears = Array.from(uniqueYears);
            uniqueYears.sort();

    const yearScale = d3.scaleBand()
                .domain(uniqueYears)
                .range([height,0]);


    const svg = d3.select('#dots')
        .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g")
        .attr("class", "circles");

    const l = svg.append("l")
        .attr("class", "legend");


    let colourRange = ([
        '#E7442E',
        '#ff8e80',
        '#e61b00',
        '#8f1100',
        '#3e0300'
    ])

    let uniqueGenres = new Set(m.map(d => d.genre))
    // console.log(uniqueGenres)


    let colour = d3.scaleOrdinal()
        .domain(uniqueGenres)
        .range(colourRange)


    // l.selectAll('dots')
    //     .data(uniqueGenres)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", 100)
    //     .attr("cy", function (d, i) {
    //         return 100 + i * 25
    //     })
    //     .attr("r", 7)
    //     .style("fill", d => colour(d.genre))

    // l.selectAll("mylabels")
    //     .data(uniqueGenres)
    //     .enter()
    //     .append("text")
    //     .attr("x", 120)
    //     .attr("y", function (d, i) {
    //         return 100 + i * 25
    //     }) // 100 is where the first dot appears. 25 is the distance between dots
    //     .style("fill", d => colour(d.genre))
    //     .text(function (d) {
    //         return d
    //     })
    //     .attr("text-anchor", "left")
    //     .style("alignment-baseline", "middle")


    svg.call(d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    function mousedowned(event, d) {
        d3.select(this).transition()
            .attr("fill", "white")
            .attr("r", radius * 3)
            .transition()
            .attr("fill", d => colour(d.genre))
            .attr("r", radius)
    }

    function zoomed({
        transform
    }) {
        g.attr("transform", transform);
    }
    
/*
We have the years vertical axis already, 
which will be used to position the grids.

Now we need to figure out the dimensions of the grids. 

1. Create a key,value object of years to the show objects.
2. Find the max number of shows watched in a year. (showArray.length)
3. Then get factors for that => 444 in this case
        6 rows and 74 columns

4. The height of each grid will be yearScale.bandwidth() 
    since that scale divides the svg evenly between each year.
5. Then we can define some margins for the area where the grids will be,
    and use them to determine the width.
6. Next we iterate through the object created in step 1.
    -Create the grid for each year.
    -Each grid will have its own x and y scale, to position the circles
    -The main complication is figuring out the y scale for each grid.
*/



    let yearContainer = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let yearAxis = yearContainer.append('g')
        .classed("yearAxis", true)
        .call(d3.axisLeft(yearScale));

    yearAxis.select(".domain")
        .attr("fill", "#fff")
        .style("opacity", 0);

    yearAxis.selectAll('.tick')
        .selectAll('text')
        .attr("fill", "#fff")
        .style("opacity", 0);



    let maxLength = 0;
    let yearData = {};
    m.forEach(d => {
        let year = d.date.getFullYear();
        if(!(year in yearData)){
            let newData = [];
            newData.push(d);
            yearData[year] = newData
        }else{
            yearData[year].push(d)
        }

        let dataCount = yearData[year];
        dataCount = dataCount.length;
        if(dataCount > maxLength){
            maxLength = dataCount;
        }
    })


    //factors of 444, the maxLength in this data
    const gridRows = 6;
    const gridCols = 74;
    const gridHeight = yearScale.bandwidth();

    const yearScales = {};
    for(let year in yearData){
            let currentYearData = yearData[year];


            let gridXScale = d3.scaleBand()
                    .domain(d3.range(gridCols))
                    .range([10,gridWidth]); //just giving the circles 10 units space from the axis

            let gridYScale = d3.scaleBand()
                .domain(d3.range(gridRows))
                .range([(yearScale(year) + radius),(yearScale(year) + radius + gridHeight)]);
            yearScales[year] = {x: gridXScale, y: gridYScale};
            }

            

    function showYearAxis(){
        yearAxis.select(".domain")
            .style("opacity", 1);

        yearAxis.selectAll('.tick')
            .selectAll('text')
            .style("opacity", 1);
    }

    function hideYearAxis(){
        yearAxis.select(".domain")
            .style("opacity", 0);

        yearAxis.selectAll('.tick')
            .selectAll('text')
            .style("opacity", 0);
    }


     function update(chartType){
        /*
            just checks for chartType == 'bars', 
            and otherwise displays the original circles shape
        */

        chartType == "bars" ?  showYearAxis() : hideYearAxis();
        let t = d3.transition()
          .duration(1550);
        
        for(let year in yearData){
            let currentYearData = yearData[year];
            let xScale = yearScales[year].x;
            let yScale = yearScales[year].y;

            //select by a class for each group, because otherwise it will select
            //ALL circles, and will mess up previously created circles
            yearContainer.selectAll(`.circles-${year}`)
                .data(currentYearData, d => d.id) //need the data key!
                .join(
                    enter => enter.append("circle")
                            .classed(`circles-${year}`, true)
                            .style("opacity", 0)
                            .call(e => e.transition(t)
                                .attr("cx", (d,i) => chartType == "bars" ? xScale(i%gridCols) : d.x)
                                .attr("cy", (d,i) => chartType == "bars" ? yScale(Math.floor(i/gridCols)) : d.y)
                                .attr("r", 4)
                                .attr("fill", d => colour(d.genre))
                                .style("opacity", 1)
                            ),
                    update => update
                            .call(e => e.transition(t)
                                .attr("cx", (d,i) => chartType == "bars" ? xScale(Math.floor(i/gridRows)) : d.x)
                                .attr("cy", (d,i) => chartType == "bars" ? yScale(i%gridRows) : d.y)

                            )
                
                    )
                .on("mousedown", mousedowned)
                .on("click", cardBuilder)
                .append("title")
                .text(d => `${d.title}: watched on ${d.date}`)
            
            }

        
        }
    
        d3.select("button#changeBar").on("click", function(){
            update("bars");
        });

        d3.select("button#changeDots").on("click", function(){
            update("");
        });


    //start with original circle shape viz
    update("");
    
}

function cardBuilder(event, d) {

    let window = document.querySelector('#modal')
    let bg = document.querySelector('.modal-bg')

    bg.classList.add('bg-active')

    let card = document.createElement('div')
    card.setAttribute('id', 'card' + '-' + d.id)
    card.setAttribute('class', 'modal-content')
    window.appendChild(card)

    let imageDiv = document.createElement('div')
    imageDiv.className = 'image-div'
    card.appendChild(imageDiv)

    let contentDiv = document.createElement('div')
    contentDiv.className = 'content-div'
    card.appendChild(contentDiv)

    let xClose = document.createElement('span')
    xClose.innerHTML = 'cancel'
    xClose.setAttribute('class', 'close material-icons')
    card.appendChild(xClose)
    xClose.addEventListener('click', function () {
        window.innerHTML = ''
        bg.classList.remove('bg-active')
    })


    let filmTitle = document.createElement('h1')
    filmTitle.innerHTML = d.title
    filmTitle.setAttribute('class', 'film-title')
    contentDiv.appendChild(filmTitle)

    let episode = document.createElement('h2');
    episode.innerHTML = d.chapter
    episode.setAttribute('class', 'film-episode')
    contentDiv.appendChild(episode);

    let filmOverview = document.createElement('p');
    filmOverview.setAttribute('class', 'film-overview')
    filmOverview.innerHTML = d.overview
    contentDiv.appendChild(filmOverview);

    let poster = document.createElement('img');
    poster.setAttribute("src", d.poster);
    poster.setAttribute('class', 'poster')
    imageDiv.appendChild(poster);
}