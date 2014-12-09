  $(document).ready(function(){
    checkCookie();
  });
  /*Array.prototype.unique=function(a){
    return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
  });*/

  function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1);
          if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
      }
      return "";
  }

  function checkCookie() {
      var user = getCookie("recurent");
      if (user != "") {
          //console.log("¡Bienvenido nuevamente a la Puerta Giratoria del Poder!");
      } else {
          setCookie("recurent", "true", 60);
      }
  }

  function eliminateDuplicates(arr) {
      var i,
          len = arr.length,
          out = [],
          obj = {};

      for (i = 0; i < len; i++) {
          obj[arr[i]] = 0;
      }
      for (i in obj) {
          out.push(i);
      }
      return out;
  };

  var margin = {
          top: 150,
          right: 10,
          bottom: 50,
          left: 100
      },
      cellSize = 25;
  col_number = 60;
  row_number = 60;
  width = cellSize * col_number, // - margin.left - margin.right,
      height = cellSize * row_number, // - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      legendElementWidth = cellSize * 2.5,
      colorBuckets = 21,
      colors = ['#005824', '#1A693B', '#347B53', '#4F8D6B', '#699F83', '#83B09B', '#9EC2B3', '#B8D4CB', '#D2E6E3', '#EDF8FB', '#FFFFFF', '#F1EEF6', '#E6D3E1', '#DBB9CD', '#D19EB9', '#C684A4', '#BB6990', '#B14F7C', '#A63467', '#9B1A53', '#91003F'];
  hcrow = [49, 11, 30, 4, 18, 6, 12, 20, 19, 33, 32, 26, 44, 35, 38, 3, 23, 41, 22, 10, 2, 15, 16, 36, 8, 25, 29, 7, 27, 34, 48, 31, 45, 43, 14, 9, 39, 1, 37, 47, 42, 21, 40, 5, 28, 46, 50, 17, 24, 13], // change to gene name or probe id
      hccol = [6, 5, 41, 12, 42, 21, 58, 56, 14, 16, 43, 15, 17, 46, 47, 48, 54, 49, 37, 38, 25, 22, 7, 8, 2, 45, 9, 20, 24, 44, 23, 19, 13, 40, 11, 1, 39, 53, 10, 52, 3, 26, 27, 60, 50, 51, 59, 18, 31, 32, 30, 4, 55, 28, 29, 57, 36, 34, 33, 35], // change to gene name or probe id
      rowLabel = [] //['Vendedor01','Vendedor02','Vendedor03','Vendedor9540','Vendedor9781','Vendedor9828','Vendedor9829','Vendedor9906','Vendedor0088','Vendedor0164','Vendedor0453','Vendedor0516','Vendedor0594','Vendedor0894','Vendedor0951','Vendedor1030','1761128_at','Vendedor1145','Vendedor1160','Vendedor1189','Vendedor1222','Vendedor1245','Vendedor1277','Vendedor1434','Vendedor1553','Vendedor1620','Vendedor1873','Vendedor1884','Vendedor1944','Vendedor2105','Vendedor2118','Vendedor2151','Vendedor2388','Vendedor2401','Vendedor2633','Vendedor2701','Vendedor2787','Vendedor2819','Vendedor2880','Vendedor2945','Vendedor2983','Vendedor3132','Vendedor3138','Vendedor3146','Vendedor3198','Vendedor99','Vendedor3410','Vendedor3426','Vendedor3490','Vendedor3491'], // change to gene name or probe id
  colLabel = [] //['Comprador027','Comprador028','Comprador029','Comprador03','Comprador030','Comprador031','Comprador032','Comprador033','Comprador034','Comprador035','Comprador036','Comprador037','Comprador038','Comprador039','Comprador040','Comprador041','Comprador08','Comprador09','Comprador10','Comprador11','Comprador12','Comprador25','Comprador26','Comprador27','Comprador28','Comprador29','Comprador30','Comprador31','Comprador32','Comprador33','Comprador34','Comprador35','Comprador36','Comprador37','Comprador38','Comprador39','Comprador4','Comprador5','Comprador50','Comprador51','Comprador52','Comprador53','Comprador6','Comprador7','Comprador74','Comprador84','Comprador85','Comprador86','Comprador87','Comprador88','Comprador89','Comprador91','Comprador92','Comprador93','Comprador94','Comprador99','con2','con200','con201','con21']; // change to contrast name

  function update(tsv){


    d3.tsv( tsv ,
        function(d) {
            return {
                row: +d.x,
                col: +d.y,
                value: +d.value,
                xlabel: +d.x,
                ylabel: +d.y
            };
        },
        function(error, data) {

            for (var i = 0; i < data.length; i++) {
                rowLabel.push(data[i].xlabel)
                colLabel.push(data[i].ylabel)
            }
            //rowLabel = rowLabel.unique();
            //colLabel = colLabel.unique();
            rowLabel = eliminateDuplicates(rowLabel);
            colLabel = eliminateDuplicates(colLabel);
            console.log(rowLabel);
            console.log(colLabel);

            var colorScale = d3.scale.quantile()
                .domain([-10, 0, 10])
                .range(colors);

            d3.select(".heatmap").remove();

            var svg = d3.select("#chart").append("svg").attr("class","heatmap")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var rowSortOrder = false;
            var colSortOrder = false;
            var rowLabels = svg.append("g")
                .selectAll(".rowLabelg")
                .data(rowLabel)
                .enter()
                .append("text")
                .text(function(d) {
                    return d;
                })
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return hcrow.indexOf(i + 1) * cellSize;
                })
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
                .attr("class", function(d, i) {
                    return "rowLabel mono r" + i;
                })
                .on("mouseover", function(d) {
                    d3.select(this).classed("text-hover", true);
                })
                .on("mouseout", function(d) {
                    d3.select(this).classed("text-hover", false);
                });
               /* .on("click", function(d, i) {
                    rowSortOrder = !rowSortOrder;
                    sortbylabel("r", i, rowSortOrder);
                    d3.select("#order").property("selectedIndex", 4).node().focus();;
                });*/

            var colLabels = svg.append("g")
                .selectAll(".colLabelg")
                .data(colLabel)
                .enter()
                .append("text")
                .text(function(d) {
                    return d;
                })
                .attr("x", 0)
                .attr("y", function(d, i) {
                    return hccol.indexOf(i + 1) * cellSize;
                })
                .style("text-anchor", "left")
                .attr("transform", "translate(" + cellSize / 2 + ",-6) rotate (-90)")
                .attr("class", function(d, i) {
                    return "colLabel mono c" + i;
                })
                .on("mouseover", function(d) {
                    d3.select(this).classed("text-hover", true);
                })
                .on("mouseout", function(d) {
                    d3.select(this).classed("text-hover", false);
                });
                /*.on("click", function(d, i) {
                    colSortOrder = !colSortOrder;
                    sortbylabel("c", i, colSortOrder);
                    d3.select("#order").property("selectedIndex", 4).node().focus();;
                });*/

            var heatMap = svg.append("g").attr("class", "g3")
                .selectAll(".cellg")
                .data(data, function(d) {
                    return d.row + ":" + d.col;
                })
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    return hccol.indexOf(d.col) * cellSize;
                })
                .attr("y", function(d) {
                    return hcrow.indexOf(d.row) * cellSize;
                })
                .attr("class", function(d) {
                    return "cell cell-border cr" + (d.row - 1) + " cc" + (d.col - 1);
                })
                .attr("width", cellSize)
                .attr("height", cellSize)
                .style("fill", function(d) {
                    return colorScale(d.value);
                })
                .on("click", function(d) {
                    console.log(d, " click");
                    mySwiper.swipeNext();

                    var code = "1509-5-L114"
                    var ticket = "0942223B-FAE2-4060-950E-36D16916F7E2"
                    var url = "http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo="+code+"&ticket="+ticket+"";
                    
                    $.ajax({
                        type: "GET",    
                        url: url,
                        cache: false,
                        crossDomain: true,
                        dataType: 'json',
                        success: function (data) {
                            alert(JSON.stringify(data));
                            var json = JSON.stringify(data);

                            console.log(json);
                        }
                    });

                })
                .on("mouseover", function(d) {
                    //highlight text
                    //console.log(d);
                    d3.select(this).classed("cell-hover", true);
                    d3.selectAll(".rowLabel").classed("text-highlight", function(r, ri) {
                        return ri == (d.row - 1);
                    });
                    d3.selectAll(".colLabel").classed("text-highlight", function(c, ci) {
                        return ci == (d.col - 1);
                    });

                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", (d3.event.pageX + 10 + $(document).width()) + "px")
                        .style("top", (d3.event.pageY - 10) + "px")
                        .select("#value")
                        .text("lables:" + rowLabel[d.row - 1] + "," + colLabel[d.col - 1] + "\ndata:" + d.value + "\nrow-col-idx:" + d.col + "," + d.row + "\ncell-xy " + this.x.baseVal.value + ", " + this.y.baseVal.value);
                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
                })
                .on("mouseout", function() {
                    d3.select(this).classed("cell-hover", false);
                    d3.selectAll(".rowLabel").classed("text-highlight", false);
                    d3.selectAll(".colLabel").classed("text-highlight", false);
                    d3.select("#tooltip").classed("hidden", true);
                });

            /* var legend = svg.selectAll(".legend")
        .data([-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10])
        .enter().append("g")
        .attr("class", "legend");
   
    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height+(cellSize*2))
      .attr("width", legendElementWidth)
      .attr("height", cellSize)
      .style("fill", function(d, i) { return colors[i]; });
   
    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return d; })
      .attr("width", legendElementWidth)
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + (cellSize*4));
*/
            // Change ordering of cells

        function sortbylabel(rORc, i, sortOrder) {
            var t = svg.transition().duration(3000);
            var log2r = [];
            var sorted; // sorted is zero-based index
            d3.selectAll(".c" + rORc + i)
                .filter(function(ce) {
                    log2r.push(ce.value);
                });
            if (rORc == "r") { // sort log2ratio of a gene
                sorted = d3.range(col_number).sort(function(a, b) {
                    if (sortOrder) {
                        return log2r[b] - log2r[a];
                    } else {
                        return log2r[a] - log2r[b];
                    }
                });
                t.selectAll(".cell")
                    .attr("x", function(d) {
                        return sorted.indexOf(d.col - 1) * cellSize;
                    });
                t.selectAll(".colLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    });
            } else { // sort log2ratio of a contrast
                sorted = d3.range(row_number).sort(function(a, b) {
                    if (sortOrder) {
                        return log2r[b] - log2r[a];
                    } else {
                        return log2r[a] - log2r[b];
                    }
                });
                t.selectAll(".cell")
                    .attr("y", function(d) {
                        return sorted.indexOf(d.row - 1) * cellSize;
                    });
                t.selectAll(".rowLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    });
            }
        }

        d3.select("#order").on("change", function() {
            order(this.value);
        });

        function order(value) {
                if (value == "hclust") {
                    var t = svg.transition().duration(3000);
                    t.selectAll(".cell")
                        .attr("x", function(d) {
                            return hccol.indexOf(d.col) * cellSize;
                        })
                        .attr("y", function(d) {
                            return hcrow.indexOf(d.row) * cellSize;
                        });

                    t.selectAll(".rowLabel")
                        .attr("y", function(d, i) {
                            return hcrow.indexOf(i + 1) * cellSize;
                        });

                    t.selectAll(".colLabel")
                        .attr("y", function(d, i) {
                            return hccol.indexOf(i + 1) * cellSize;
                        });

                } else if (value == "probecontrast") {
                    var t = svg.transition().duration(3000);
                    t.selectAll(".cell")
                        .attr("x", function(d) {
                            return (d.col - 1) * cellSize;
                        })
                        .attr("y", function(d) {
                            return (d.row - 1) * cellSize;
                        });

                    t.selectAll(".rowLabel")
                        .attr("y", function(d, i) {
                            return i * cellSize;
                        });

                    t.selectAll(".colLabel")
                        .attr("y", function(d, i) {
                            return i * cellSize;
                        });

                } else if (value == "probe") {
                    var t = svg.transition().duration(3000);
                    t.selectAll(".cell")
                        .attr("y", function(d) {
                            return (d.row - 1) * cellSize;
                        });

                    t.selectAll(".rowLabel")
                        .attr("y", function(d, i) {
                            return i * cellSize;
                        });
                } else if (value == "contrast") {
                    var t = svg.transition().duration(3000);
                    t.selectAll(".cell")
                        .attr("x", function(d) {
                            return (d.col - 1) * cellSize;
                        });
                    t.selectAll(".colLabel")
                        .attr("y", function(d, i) {
                            return i * cellSize;
                        });
                }
            }
     
    });

  }
