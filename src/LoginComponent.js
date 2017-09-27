import React, { Component } from 'react';
import axios from 'axios';
import { Platform, Linking } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from './redux';
import SafariView from 'react-native-safari-view';

class LoginComponent extends Component {
  constructor(props){
    super(props);
    this.decodeUser = this.decodeUser.bind(this);
    this.login = this.login.bind(this);
    this.state = {
      apiDesc: null
    }
  }
  
  componentDidMount(){
    Linking.addEventListener('url', this.decodeUser);
    Linking.getInitialURL().then(url => this.decodeUser({url}));

    if(this.props.loginRoot === null || this.props.loginRoot === undefined){
      this.setState({apiDesc: {error: { message: "The app may be outdated."}}});
    }else{
      axios.get(this.props.loginRoot + "/login_descriptors").then(
        res => this.setState({apiDesc: res.data}), 
        err => this.setState({apiDesc: {error: {message: `Failed to load login: ${err}`}}})
      );
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.decodeUser);
  };

  decodeUser({ url }){
    if(!url) return;
    const [, tokenParamMatch] = url.match(/user=([^#]+)/);
    let tokenParam = tokenParamMatch && decodeURIComponent(tokenParamMatch);
    let data = tokenParam ? parseToken(tokenParam) : null;

    if(data){
      this.props.LoginUser(
        data.user, 
        data.token, 
        this.props.loginLocation, 
        this.props.defaultLocation, 
        (...rest) => console.log("Navigate somewhere!", ...rest)
      );
    }

    if (Platform.OS === 'ios') {
      SafariView.dismiss();
    }
  };

  login(url){
    if (Platform.OS === 'ios') {
      SafariView.show({
        url: url,
        fromBottom: true,
      });
    }
    else {
      Linking.openURL(url);
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

    const login = this.login;
    let loginMethods = this.state.apiDesc.map(loginMethod => {
      let href = this.props.loginRoot + loginMethod.login;
      let name = loginMethod.name.charAt(0).toUpperCase() + loginMethod.name.slice(1);
      loginMethod.properName = name;
      loginMethod.login = () => login(href);
      return this.props.mapLoginToElement(loginMethod);
    });

    const wrappedChildren = this.props.wrapLoginMethods(loginMethods);

    return wrappedChildren;
  }
}

function parseToken (token) {
  try{
    let data = JSON.parse(token);
    return data;
  }catch(SyntaxError){
    return null;
  }
}

export default connect(null, Actions)(LoginComponent);
