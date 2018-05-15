import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  XYPlot,
  VerticalRectSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  Borders,
  Hint
} from 'react-vis';

/*
  data = array of datum
  datum = {
    x : horizontal position,
    y : vertical position,
    n : number of characters,
    published_date : date,
    law_stage : penyelidikan/penyidikan/penyidikan+praperadilan/penuntutan/penuntutan+praperadilan/praperadilan/pemeriksaan/upaya hukum ,
    characters : [
      {
        color : color of representation,
        name : name,
        role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
        social_status : [

        ]
      }
    ],
    "location": {
      "color": "#79C7E3",
      "name": "Mapolda Metro Jaya",
      "city": "Jakarta Pusat"
    },
    "time": {
      "color": "#FF9833",
      "name": "Siang"
    },
  }
*/

class LocationVis extends Component {
  constructor(props){
    super(props);
    super(props);
    this.state = {
      location_hints: [
        /*
          {
            name : name,
            city : city,
          },
        */
      ],
      location_positions: [
        /*
          {
            name : name,
            positions : [
              {
                x0 : horizontal position start,
                x : horizontal position end,
                y0 : vertical position start,
                y : vertical position end,
                color : color of representation,
              }
            ],
          },
        */
      ],
      highlighted_data: [],
      hint_position: {},
      checked: true,
    }
    this.preprocessData = this.preprocessData.bind(this);
    this.onClickLabel = this.onClickLabel.bind(this);
  }

  componentWillMount() {
    this.preprocessData(this.props.data);
  }

  preprocessData(data) {
    var location_positions = [];
    var location_hints = [];
    for (var i = 0; i < data.length; i++) {
      const datum = data[i];
      const location = data[i].location;
      if(!_.isEmpty(location)){
        const index = _.findIndex(location_positions, (value)=>{
          return (value.name == datum.location.name);
        })
        if(index == -1){
          location_positions.push({
            name : location.name,
            positions : [
              {
                x0: (datum.x + this.props.horizontal_white_space),
                x: (datum.x + 1 - this.props.horizontal_white_space),
                y0: 0,
                y: 1,
                color: location.color,
              }
            ]
          });
          location_hints.push([
            {
              name: location.name,
              city: location.city
            }
          ])
        } else {
          location_positions[index].positions.push({
            x0: (datum.x + this.props.horizontal_white_space),
            x: (datum.x + 1 - this.props.horizontal_white_space),
            y0: 0,
            y: 1,
            color: location.color,
          });
          location_hints[index].push({
            name: location.name,
            city: location.city
          })
        }
      }
    }
    this.setState({
      
      location_positions: location_positions,
      location_hints: location_hints,
    });
    this.props.setLocationLength(location_positions.length);    
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlighted_data, nextProps.highlighted_data)) {
      var highlighted_data = [];
      var hint_position = {};
      if (!_.isEmpty(nextProps.highlighted_data) && nextProps.highlighted_data.x0 && nextProps.highlighted_data.x) {
        highlighted_data = [{
          x0: nextProps.highlighted_data.x0,
          x: nextProps.highlighted_data.x,
          y0: 0,
          y: 1,
          color: "transparent"
        }];
        hint_position = {
          x: nextProps.highlighted_data.x,
          y: 1,
        }
      }
      this.setState({
        
        highlighted_data: highlighted_data,
        hint_position: hint_position,
      });
    }
    if (!_.isEqual(this.props.adjust_viewed_location, nextProps.adjust_viewed_location)) {
      if ((nextProps.adjust_viewed_location[0] == "all")||(nextProps.adjust_viewed_location.length == this.state.location_positions.length)){
        this.setState({
          
          checked: true,
        });
      } else {
        this.setState({
          
          checked: false,
        });
      }
    }
    if(!_.isEqual(this.props.data,nextProps.data)){
      this.preprocessData(nextProps.data);
    }
  }

  onCheckboxButton() {
    if (this.state.checked) {
      this.setState({
        
        checked: false
      });
      this.props.onHideAllLocation();
    } else {
      this.setState({
        
        checked: true
      });
      this.props.onResetViewedLocation();
    }
  }

  onClickLabel(event, color){
    event.preventDefault();
    this.props.onAddViewedLocation(color);
  }

  render() {
    const { RIGHT, TOP } = Hint.ALIGN;
    const { handleMouseOver } = this.props;
    return (
      <div className="inline-label-vis">
        <div className="field"
          style={{
            width: "100px",
            marginBottom: "0",
            marginLeft: "1.25rem",
            height: "1.5rem"
          }}>
          <div
            className="control">
            <label className="checkbox">
              <input
                onChange={this.onCheckboxButton.bind(this)}
                type="checkbox"
                checked={this.state.checked} />
              <b className="is-size-7">Lokasi</b>
            </label>
          </div>
        </div>
        <hr style={{
          margin: ".2rem 0"
        }} />
        {_.map(this.state.location_positions, (location_position, index) => {
          return (
            <div key={index}
              className="level">
              <a className="level-left"
                onClick={(event) => { this.onClickLabel(event, location_position.positions[0].color)} }
                style={{
                  color: "black"
                }}>
                <div className="level-item">
                  <p className="is-size-7 elipsis"
                    style={{ width: "100px" }}>
                    {location_position.name}
                  </p>
                </div>
              </a>
              <div className="level-right">
                <div className="level-item">
                  <XYPlot
                    colorType="literal"
                    margin={{ left: 0, top: 0, bottom: 0, right: 0 }}
                    width={this.props.width - 110}
                    height={this.props.height}
                    xDomain={this.props.xDomain}
                    onMouseLeave={function () {
                      if (!this.props.clicked) {
                        handleMouseOver({})
                      }
                    }.bind(this)}>
                    <VerticalRectSeries
                      data={[{
                        x0: (this.props.xDomain[0]),
                        x: (this.props.xDomain[1]),
                        y: 0,
                        y: 1,
                        color: "#f1f1f1"
                      }]} />
                    {(() => {
                      if (this.props.adjust_viewed_location[0] == "all") {
                        return (
                          <VerticalRectSeries
                            data={location_position.positions} />
                        );
                      } if (_.findIndex(this.props.adjust_viewed_location, (color) => { return (color == location_position.positions[0].color) }) != -1) {
                        return (
                          <VerticalRectSeries
                            data={location_position.positions} />
                        );
                      }
                    })()}
                    {(() => {
                      if (this.state.highlighted_data.length != 0) {
                        const hightlight_index = _.findIndex(location_position.positions, (value) => {
                          return ((value.x == this.state.highlighted_data[0].x) && (value.x0 == this.state.highlighted_data[0].x0));
                        });
                        if (hightlight_index != -1) {
                          return (
                            <VerticalRectSeries
                              data={this.state.highlighted_data}
                              stroke="#363636"
                              style={{ strokeWidth: 3 }} />
                          );
                        } else {
                          var temp = _.clone(this.state.highlighted_data, true);
                          temp[0].color = "#363636"
                          return (
                            <VerticalRectSeries
                              data={temp}
                              style={{ opacity: .1 }} />
                          )
                        }
                      }
                    })()}
                    <Borders style={{
                      bottom: { fill: 'transparent' },
                      left: { fill: '#fff' },
                      right: { fill: 'transparent' },
                      top: { fill: 'transparent' }
                    }}/>
                    <VerticalRectSeries
                      opacity={0}
                      onValueMouseOver={function (datapoint) {
                        if (!this.props.clicked) {
                          handleMouseOver(datapoint)
                        }
                      }.bind(this)}
                      onValueClick={this.props.onClickForView}
                      data={location_position.positions} 
                      style={{
                        cursor: "pointer"
                      }}/>
                    {/* Component for display hint */}
                    {(() => {
                      if (!_.isEmpty(this.state.hint_position)) {
                        const hint_index = _.findIndex(location_position.positions, (value) => {
                          return ((value.x == this.state.highlighted_data[0].x) && (value.x0 == this.state.highlighted_data[0].x0));
                        });
                        if (hint_index != -1) {
                          const hint_text = this.state.location_hints[index][hint_index];
                          return (
                            <Hint
                              align={{
                                horizontal: RIGHT,
                                vertical: TOP
                              }}
                              value={this.state.hint_position}>
                              <div className="tags has-addons character-vis-hint">
                                <span className="arrow-left"></span>
                                <span className="tag is-dark has-text-warning">{hint_text.name}</span>
                                {(()=>{
                                  if (hint_text.city){
                                    return <span className="tag is-success">{hint_text.city}</span>
                                  }
                                })()}
                              </div>
                            </Hint>
                          );
                        }
                      }
                    })()}
                  </XYPlot>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    );
  }
}

LocationVis.propTypes = {
  data: PropTypes.array.isRequired,
  xDomain: PropTypes.array.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  highlighted_data: PropTypes.object,
  handleMouseOver: PropTypes.func.isRequired,
  onAddViewedLocation: PropTypes.func.isRequired,
  onResetViewedLocation: PropTypes.func.isRequired,
};

export default LocationVis;