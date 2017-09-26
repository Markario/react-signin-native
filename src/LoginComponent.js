import React, { Component } from 'react';
import axios from 'axios';

export default class LoginComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      apiDesc: null
    }
  }
  
  componentDidMount(){
    if(this.props.loginRoot === null || this.props.loginRoot === undefined){
      this.setState({apiDesc: {error: { message: "The app may be outdated."}}});
    }else{
      axios.get(this.props.loginRoot + "/login_descriptors").then(
        res => this.setState({apiDesc: res.data}), 
        err => this.setState({apiDesc: {error: {message: `Failed to load login: ${err}`}}})
      );
    }
  }

  render() {
    if(!this.state.apiDesc){
      return null;
    }

    if(this.state.apiDesc.error){
      let error = this.state.apiDesc.error.message ? this.state.apiDesc.error.message : "Unknown error";
      if(this.props.errorComponent)
        return React.createElement(this.props.errorComponent, { error });
      return null;
    }

    let loginMethods = this.state.apiDesc.map(loginMethod => {
      let href = this.props.loginRoot + loginMethod.login;
      let name = loginMethod.name.charAt(0).toUpperCase() + loginMethod.name.slice(1);
      loginMethod.properName = name;
      loginMethod.href = href;
      return this.props.mapLoginToElement(loginMethod);
    });

    const wrappedChildren = this.props.wrapLoginMethods(loginMethods);

    return wrappedChildren;
  }
}
