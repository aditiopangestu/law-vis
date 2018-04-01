import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import {
  XYPlot,
  VerticalRectSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis
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
    ]
  }
*/

class CharacterVis extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      character_hints : [
      /*
        [
          {
            name : name,
            role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
            social_status : [

            ]
          },
        ],
      */
      ],
      character_positions: [
        /*
          {
            role : saksi, tersangka, terdakwa, penasihat hukum , penyelidik, penyidik, penuntut umum, hakim
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
      character_tic_names: [

      ],
      character_tic_values: [

      ],
    }
    this.characterTicFormat = this.characterTicFormat.bind(this);
    this.preprocessData = this.preprocessData.bind(this);
  }

  componentWillMount(){
    this.preprocessData(this.props.data);
  }

  preprocessData(data){
    var character_positions = [];
    var character_hints = [];
    var character_tic_names = [];
    var character_tic_values = [];
    var character_index = 0;
    for(var i = 0; i < data.length; i++){
      const datum = data[i];
      for(var j=0; j<datum.n;j++){
        const character_datum = datum.characters[j];
        const index = _.findIndex(character_positions, (value)=>{
          return (value.role == character_datum.role);
        });
        if(index == -1){
          character_tic_names.push(character_datum.role);
          character_tic_values.push(character_index);
          character_index++;
          character_positions.push({
            role: character_datum.role,
            positions : [
              {
                x0 : datum.x,
                x : (datum.x+1),
                y0 : datum.y,
                y : (datum.y+1),
                color: character_datum.color
              }
            ]
          });
          character_hints.push([
            {
              name: character_datum.name,
              role: character_datum.role,
              social_status: character_datum.social_status,
            }
          ]);
        } else {
          character_positions[index].positions.push({
            x0: datum.x,
            x: (datum.x + 1),
            y0: datum.y,
            y: (datum.y + 1),
            color: character_datum.color
          });
          character_hints[index].push({
            name: character_datum.name,
            role: character_datum.role,
            social_status: character_datum.social_status,
          })
        }
      }
    }
    this.setState({
      character_positions : character_positions,
      character_hints: character_hints,
      character_tic_names: character_tic_names,
      character_tic_values: character_tic_values,
    });
  }
  
  characterTicFormat(value){
    const index = _.findIndex(this.state.character_tic_values, (character_tic_value) => {
      return (character_tic_value == value);
    });
    if(index != -1){
      return this.state.character_tic_names[index];
    }
  }

  render(){
    return (
      <XYPlot
        margin={{ left: 100, top: 0, bottom: 10 }}
        width={this.props.width}
        height={this.props.height}>
        <HorizontalGridLines/>
        <YAxis hideTicks hideLine tickValues={this.state.character_tic_values} tickFormat={this.characterTicFormat} />
        {
          _.map(this.state.character_positions, (character_position, index)=>{
            return (
              <VerticalRectSeries key={index}
                data={character_position.positions}/>
            )
          })
        }
      </XYPlot>
    );
  }
}

CharacterVis.propTypes  = {
  data: PropTypes.array.isRequired,
  horizontal_white_space: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default CharacterVis;