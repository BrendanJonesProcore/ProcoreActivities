import React, { Component } from 'react';
import { Avatar, Dropdown, Menu } from '@procore/core-react';
import axios from 'axios';

class AvatarDropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarUrl: ""
    }
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    axios.get('/api/avatar_url')
      .then(function (response) {
        this.setState({avatarUrl: response.data})
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      });
  }

  handleClick(key) {
    if(key == "logout") {
      window.location.replace('/auth/logout')
    } else {
      this.props.switchCampus();
    }
  }

  render() {
    const overlay = (
      <Menu onSelect={(item) => this.handleClick(item.item.key)}>
        <Menu.Options>
          <Menu.Item key="logout">Sign Out</Menu.Item>
          <Menu.Divider/>
          <Menu.Item key="campus">Switch Campus</Menu.Item>
        </Menu.Options>
      </Menu>
    )
    return(
      <Dropdown overlay={overlay}>
        {() =>
          <Avatar id="avatar_image" size="md" clickable style={{ cursor: "pointer" }}>
            <Avatar.Portrait imageUrl={this.state.avatarUrl} />
          </Avatar>}
      </Dropdown>
    )
  }
}
export default AvatarDropDown;
