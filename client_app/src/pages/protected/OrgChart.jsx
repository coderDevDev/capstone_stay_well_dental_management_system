import React, { Component } from 'react';

import OrgChart from '@balkangraph/orgchart.js';
export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.divRef = React.createRef();
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.chart = new OrgChart(this.divRef.current, {
      nodes: this.props.nodes,
      // mouseScrool: OrgChart.action.none,
      scaleInitial: OrgChart.match.boundary,
      // template: 'isla',
      tags: {
        Management: {
          template: 'rony'
        },
        'Marketing Manager': {
          template: 'polina'
        },
        'IT Manager': {
          template: 'ana'
        },
        IT: {
          template: 'ula'
        },
        Marketing: {
          template: 'belinda'
        }
      },
      nodeBinding: {
        field_0: 'name',
        field_1: 'title',
        img_0: 'img'
      }
    });
  }

  render() {
    return <div id="tree" ref={this.divRef}></div>;
  }
}
