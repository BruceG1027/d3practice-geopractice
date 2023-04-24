const EDUCATION_FILE =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
const COUNTY_FILE =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

const w = 1600;
const h = 1000;
const padding = { w: 200, h: 200 };

let body = d3.select("body");

const title = body.append("h2").html("United States Educational Attainment");

const subTitle = body
  .append("h4")
  .html(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  );

var path = d3.geoPath();

let svg = d3
  .select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  // .style("background", "pink");

// tooltip




Promise.all([fetch(EDUCATION_FILE), fetch(COUNTY_FILE)])
  .then((responses) =>
    Promise.all(responses.map((response) => response.json()))
  )
  .then((data) => ready(data[0], data[1]))
  .catch((error) => console.error(error));



function ready(education, us) {
  console.log(us);
  console.log(education);
  // 颜色比例尺 图例
  min = d3.min(education, (d) => d.bachelorsOrHigher)
  max = d3.max(education, (d) => d.bachelorsOrHigher)
  let colorScale = d3
    .scaleThreshold()
    .domain(d3.range(min, max, (max - min) / 8))
    .range(d3.schemeBlues[9]);
  
  svg.append('g')
      .attr('class', 'label')
      .attr('transform', 'translate(900,80)')
      .selectAll('rect')
      .data(colorScale.domain())
      .enter()
      .append('rect')
      .attr('width', 60)
      .attr('height', 20)
      .attr('x', (d, i) => i*60)
      .attr('fill', (d) => colorScale(d))

  let labelScale = d3.scalePoint()
                      .domain(d3.range(min, max, (max - min) / 9))
                      .range([0, 60 * d3.range(min, max, (max - min) / 8).length])

  console.log(labelScale.domain());
  console.log(labelScale.range());

  let labelAxis = d3.axisBottom(labelScale).ticks(8)
  d3.select('.label').append('g')
        .attr('class', 'label-axis')
        .attr('transform', 'translate(0, 20)')
        .call(labelAxis)

  d3.select('.label-axis').selectAll('text')
            .text((d) => d.toFixed(0) + '%')
            .attr('transform', 'translate(0, 8)')
  d3.select('.label-axis')
    .selectAll('line')
    .attr('y2', -20)
    .attr('y1', 10)
  d3.select('.label-axis')
    .select('.domain')
    .remove()
// console.log(colorScale.domain());


  // 图像部分
  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", function (d) {
      return d.id;
    })
    .attr("data-education", function (d) {
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      console.log("could find data for: ", d.id);
      return 0;
    })
    .attr("fill", function (d) {
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return colorScale(result[0].bachelorsOrHigher);
      }
      return colorScale(0);
    })
    .attr("d", path)
    .on('mouseover', (d) => {
      let result = education.filter((o) => o.fips === d.id)
      let str = result[0] ? '<span>' + result[0].state + '</span>' +
      '<span>' + result[0].area_name + '</span>' +
      '<span>' + result[0].bachelorsOrHigher + '%</span>'
      : '<span>no data </span>'
      tip.show(str).offset([-10, 60])
    })
    .on('mouseout', () => {
      tip.hide()
    })


  // 州界限
  svg.append('path')
      //和data类似
      .datum(
      topojson.mesh(us, us.objects.states, function (a, b) {
        return a !== b;
        })
      )
      .attr('class', 'states')
      .attr('d', path);

  // 标签部分
  let tip = d3.tip()
              .attr('class', 'd3-tip')
              .html((d) => d)
              
  svg.call(tip)



}
