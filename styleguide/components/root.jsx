import React from "react";

// import {
//   button
// } from "../../src/components";

// import Header from './Header'
// import Features from './Features'
// import ComponentDoc from './ComponentDoc'
// import Related from './Related'

const css = `
html { -webkit-text-size-adjust: 100% }
.NavItem:hover,
.Button:hover {
  box-shadow: inset 0 0 0 9999px rgba(0, 128, 255, .125);
}
.Button:disabled { opacity: .5 }
`;

class Root extends React.Component {

  constructor () {
    super();
  }

  // static childContextTypes = {
  //   rebass: React.PropTypes.object
  // }

  // getChildContext () {
  //   return {
      // rebass: {
      //   colors: {
      //     ...config.colors,
      //     gray2: '#666',
      //     darken: 'rgba(0, 0, 0, .9375)',
      //     d1: 'rgba(0, 0, 0, .125)'
      //   },
      //   Divider: {
      //     borderColor: 'inherit'
      //   },
      //   PageHeader: {
      //     borderColor: 'inherit'
      //   },
      //   SectionHeader: {
      //     borderColor: 'inherit'
      //   }
      // }
  //   };
  // }

  // <Header {...this.props} />

  render () {
    const {
      components,
      base,
      // examples,
      description,
      version,
      ga
    } = this.props;
    return (
      <ul>
        {components.map(c => (<a key={c.name} href={`#${c.name}`} children={c.name}></a>))}
        {components.map(c => (<c.Component {...c.props} />))}
      </ul>
    );
  }
}

export default Root;
