define(['jquery', 'react', 'reactDom', 'd3'], function($, React, ReactDOM, d3) {
  return {
    load: function() {
      var filters = {
        user_email: null,
        input_file: null,
        output_file: null,
        layer: null,
        wellplate: null
      }

      var maxRows = 50;
      var node = document.getElementById("main");
      var detailsNode = document.getElementById("details");
      var lastSelection = null;
      var selectedGraph = showElasticityGraph;
      var jobs = [];
      var filtered_data = [];

      var showElasticityGraph = function() {
        $('#graph').empty();

        d3.select(
          "#graph"
        ).selectAll(
          "div"
        ).data(
          filtered_data
        ).enter().append(
          "div"
        ).style(
          "height", 
          function(dataPoint) { 
            return dataPoint.print_data.elasticity * 2 + "px"; 
          }
        );
      }

      var showLiveGraph = function() {
        $('#graph').empty();

        d3.select(
          "#graph"
        ).selectAll(
          "div"
        ).data(
          filtered_data
        ).enter().append(
          "div"
        ).style(
          "height", 
          function(dataPoint) { 
            return dataPoint.print_data.livePercent * 2 + "px"; 
          }
        );
      }

      var showDeadGraph = function() {
        $('#graph').empty();

        d3.select(
          "#graph"
        ).selectAll(
          "div"
        ).data(
          filtered_data
        ).enter().append(
          "div"
        ).style(
          "height", 
          function(dataPoint) { 
            return dataPoint.print_data.deadPercent * 2 + "px"; 
          }
        );
      }

      var Options = React.createClass({
        render: function() {
          return React.createElement("div", {}, 
            React.createElement("div", {}, "Max Rows"),
            React.createElement("input", {
              type: "number",
              onChange: function(e) {
                var value = $(e.target).val();
                console.log(value);
                maxRows = value;
                ReactDOM.render(React.createElement(JobList, {filters: filters}, jobs), node, selectedGraph);
              }
            })
          )          
        }
      })

      var GraphList = React.createClass({
        getInitialState: function() {
          return  {
            selected: "elasticity"
          }
        },
        render: function() {
          return React.createElement("ul", {className: "graph-elements graph-labels"},
              React.createElement("li", {
                onClick: $.proxy(function() { 
                  selectedGraph = showElasticityGraph;
                  this.setState({selected: "elasticity"}, selectedGraph)
                }, this),
                className: this.state.selected == "elasticity" ? "touched" : ""
              }, "Elasticity"),
              React.createElement("li", {
                onClick: $.proxy(function() { 
                  selectedGraph = showLiveGraph;
                  this.setState({selected: "live"}, selectedGraph)
                }, this),
                className: this.state.selected == "live" ? "touched" : ""
              }, "Live Percent"),
              React.createElement("li", {
                onClick: $.proxy(function() { 
                  selectedGraph = showDeadGraph;
                  this.setState({selected: "dead"}, selectedGraph)
                }, this),
                className: this.state.selected == "dead" ? "touched" : ""
              }, "Dead Percent")
          );
        }
      });

      var JobList = React.createClass({
        render: function() {
          var filtered_jobs = [];
          filtered_data = []
          $.each(this.props.children, $.proxy(function(idx, item) {
              if(filtered_jobs.length >= maxRows) return;

            var do_filtering = false;

            if(this.props.filters.user_email && !item.user_info.email.match(this.props.filters.user_email)) {
              do_filtering = true;
            } else if(this.props.filters.input_file && !item.print_info.files.input.match(this.props.filters.input_file)) {
              do_filtering = true;
            } else if(this.props.filters.output_file && !item.print_info.files.output.match(this.props.filters.output_file)) {
              do_filtering = true;
            } else if(this.props.filters.layer && item.print_info.resolution.layerNum != this.props.filters.layer) {
              do_filtering = true;
            } else if(this.props.filters.wellplate && item.print_info.wellplate != this.props.filters.wellplate) {
              do_filtering = true;
            }

            if(!do_filtering) {
              filtered_data.push(item);       

              var key = item.user_info.email + "-" + item.print_info.files.input + "-" + 
                item.print_info.resolution.layerNum;   
              filtered_jobs.push(React.createElement(Job, {key: key, job: item}));
            }            
          }, this));

          return React.createElement("ul", {className: "jobs"}, filtered_jobs);
        }
      });

      var Job = React.createClass({        
        getInitialState: function() {
          return {
            state: "inactive"
          }
        },
        render: function() {
          return React.createElement(
            "li", 
            {
              className: "job-row",
              onClick: $.proxy(function() {
                console.log("Rendering");
                ReactDOM.render(React.createElement(JobDetails, this.props.job), detailsNode);
                this.setState({state: "selected"});

                if(lastSelection && lastSelection !== this) {
                  lastSelection.setState({state: "inactive"});
                }
                lastSelection = this;
              }, this)
            }, 
            React.createElement("ul", {className: "job-elements " + this.state.state},
              React.createElement("li", {}, this.props.job.user_info.email),
              React.createElement("li", {}, this.props.job.print_info.files.input),
              React.createElement("li", {}, this.props.job.print_info.files.output),
              React.createElement("li", {}, this.props.job.print_info.resolution.layerNum),
              React.createElement("li", {}, this.props.job.print_info.wellplate)
            )
          );
        }
      });

      var JobDetails = React.createClass({
        render: function() {
          return React.createElement("ul", {className: "job-details"},
              React.createElement("li", {},
                React.createElement("h2", {}, "Print Data"),
                React.createElement("ul", {},
                  React.createElement("li", {}, 
                    React.createElement("div", {className: "details-label"}, "Dead Percent: "),
                    React.createElement("div", {className: "details-value"}, this.props.print_data.deadPercent)
                  ),
                  React.createElement("li", {}, 
                    React.createElement("div", {className: "details-label"}, "Live Percent: "),
                    React.createElement("div", {className: "details-value"}, this.props.print_data.livePercent)
                  ),
                  React.createElement("li", {}, 
                    React.createElement("div", {className: "details-label"}, "Elasticity: "),
                    React.createElement("div", {className: "details-value"}, this.props.print_data.elasticity)
                  )  
                )
              ),
              React.createElement("li", {},
                React.createElement("h2", {}, "Print Info"),
                React.createElement("ul", {},
                  React.createElement("li", {},
                    React.createElement("h3", {}, "Crosslinking"),
                    React.createElement("ul", {},
                      React.createElement("li", {},
                        React.createElement("div", {className: "details-label"}, "Duration: "),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.crosslinking.cl_duration)
                      ),
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Intensity: "),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.crosslinking.cl_intensity)
                      ),
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Enabled: "), 
                        React.createElement("div", {className: "details-value"}, this.props.print_info.crosslinking.cl_enabled ? "true" : "false")
                      )
                    )
                  ),
                  React.createElement("li", {}, 
                    React.createElement("h3", {}, "Files"),
                    React.createElement("ul", {},
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Input: "),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.files.input)
                      ),
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Output: "),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.files.output)
                      )
                    )
                  ),
                  React.createElement("li", {}, 
                    React.createElement("h3", {}, "Pressure"),
                    React.createElement("ul", {},
                      React.createElement("li", {},
                        React.createElement("div", {className: "details-label"}, "Extruder 1: "),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.pressure.extruder1)
                      ),
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Extruder 2: "),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.pressure.extruder2)
                      )
                    )
                  ),
                  React.createElement("li", {}, 
                    React.createElement("h3", {}, "Resolution"),
                    React.createElement("ul", {},
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Layer Height:"),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.resolution.layerHeight)
                      ),
                      React.createElement("li", {}, 
                        React.createElement("div", {className: "details-label"}, "Layer Number:"),
                        React.createElement("div", {className: "details-value"}, this.props.print_info.resolution.layerNum)
                      )
                    )
                  ),
                  React.createElement("li", {}, 
                    React.createElement("div", {className: "details-label"}, "Wellplate: "),
                    React.createElement("div", {className: "details-value"}, this.props.print_info.wellplate)
                  )
                )
              ),
              React.createElement("li", {},
                React.createElement("h2", {}, "User Details"),
                React.createElement("ul", {},
                  React.createElement("li", {}, 
                    React.createElement("div", {className: "details-label"}, "Email: "),
                    React.createElement("div", {className: "details-value"}, this.props.user_info.email)
                  ),
                  React.createElement("li", {}, 
                    React.createElement("div", {className: "details-label"}, "Serial: "),
                    React.createElement("div", {className: "details-value"}, this.props.user_info.serial)
                  )
                )
              )
          )
        }
      });

      var Filter = React.createClass({
        render: function() {
          return React.createElement("input", {
            name: this.props.name, 
            type: this.props.type,
            onChange: $.proxy(function(e) {
              var value = $(e.target).val();
              filters[this.props.name] = value == "" ? null : value;
              console.log("On Change", value, filters[name]);

              ReactDOM.render(React.createElement(JobList, {filters: filters}, jobs), node, selectedGraph);
            }, this)
          });
        }
      });

      var SearchBar = React.createClass({
        render: function() {
          return React.createElement("li", {className: "search-row"}, 
            React.createElement("ul", {className: "search-elements search-labels"},
              React.createElement("li", {}, "User Email"),
              React.createElement("li", {}, "Input File"),
              React.createElement("li", {}, "Output File"),
              React.createElement("li", {}, "Layer"),
              React.createElement("li", {}, "Wellplate")
            ),
            React.createElement("ul", {className: "search-elements search-fields"},
              React.createElement("li", {}, React.createElement(Filter, {name: "user_email", type: "text"})),
              React.createElement("li", {}, React.createElement(Filter, {name: "input_file", type: "text"})),
              React.createElement("li", {}, React.createElement(Filter, {name: "output_file", type: "text"})),
              React.createElement("li", {}, React.createElement(Filter, {name: "layer", type: "text"})),
              React.createElement("li", {}, React.createElement(Filter, {name: "wellplate", type: "text"}))
            )
          );
        }
      });

      ReactDOM.render(React.createElement(GraphList, {}), document.getElementById("graph-list"));
      ReactDOM.render(React.createElement(SearchBar, {}), document.getElementById("search"));
      ReactDOM.render(React.createElement(Options, {}), document.getElementById("options"));

      $.getJSON("/printer.json", function(data) {
        jobs = data;
        filtered_data = data.slice(0, Math.min(maxRows, data.length));
        ReactDOM.render(React.createElement(JobList, {filters: filters}, jobs), node, selectedGraph);
      });
    }
  }
});