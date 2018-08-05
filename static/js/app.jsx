import React, { Component } from 'react';
import { ToolHeader, FlexList, Button, Tabs, Page, Sidebar, Switch } from '@procore/core-react';
import { Modal as BModal, FormControl} from 'react-bootstrap';
import CreateEventForm from './createEventForm';
import CreateTimeCapsule from './createTimeCapsule';
import GridView from './createEventCards';
import AvatarDropDown from './avatarDropdown';
import '../css/index.css';
import axios from 'axios';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      myView: false,
      calView: false,
      loc: null,
      filters: [],
      events: [],
      campus: '',
      noLoc: false
    }

    this.calToggle = this.calToggle.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.updateCampus = this.updateCampus.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.setNoLoc = this.setNoLoc.bind(this);
    this.refreshEvents = this.refreshEvents.bind(this);
  }

  refreshEvents() {
    axios.get('/api/events/all')
      .then(function (response) {
        if(response.data) {
          this.setState({events: response.data});
        }
     }.bind(this));
  }

  calToggle () {
    this.setState({calView: !this.state.calView})
  }

  handleFilterClick(i) {
    if (this.state.filters.toString().indexOf(i) !== -1) {
      this.setState({filters: this.state.filters.filter(tag => tag != i)});
    } else {
      this.setState({filters: this.state.filters.concat(i)});
    }
  }

  updateCampus(event) {
    this.setState({
      campus: event.target.value
    })
  }

  componentDidMount() {
    axios.get('/api/events/all')
      .then(function (response) {
        console.log(response);
        if(response.data.needsCampus) {
          this.setState({noLoc: true});
       } else {
         this.setState({events: response.data});
       }
     }.bind(this))
     .catch(function (error) {
     });
  }

setNoLoc() {
  this.setState({noLoc: true});
}

tabClick(tab) {
  if(tab == "my" && !this.state.myView) {
    this.setState({myView: true});
  } else if(tab == "all" && this.state.myView) {
    this.setState({myView: false});
  }
};

  handleClose() {
    if(this.state.campus == '') {
      alert('Please choose a campus location');
    } else {
      // call to set location here
      axios({
        method: 'post',
        url: 'api/users/update_campus',
        data: {campus: this.state.campus}
      }).then(this.setState({noLoc: false}))
      .then(this.refreshEvents);
      //this.setState({noLoc: false});
    }
  }
  
  render() {    

    var mainPage;
    if(this.state.noLoc) {
      mainPage = <BModal show={true} onHide={this.handleClose}>
        <BModal.Header>
          <BModal.Title>Location</BModal.Title>
        </BModal.Header>

        <BModal.Body>
          <h5>Please choose your Procore campus:</h5>

          <FormControl componentClass="select" value={this.state.campus} onChange={this.updateCampus}>
            <option disabled='true' value=''>Select</option>
            <option value="carpinteria_ca">Carpinteria, CA</option>
            <option value="austin_tx">Austin, TX</option>
            <option value="new_york">New York, NY</option>
            <option value="portland_or">Portland, OR</option>
            <option value="san_diego_ca">San Diego, CA</option>
            <option value="san_francisco_ca">San Francisco, CA</option>
            <option value="willmar_mn">Willmar, MN</option>
            <option value="london_uk">London, United Kingdom</option>
            <option value="sydney_au">Sydney, Australia</option>
            <option value="toronto_ca">Toronto, Canada</option>
            <option value="vancouver_ca">Vancouver, Canada</option>
          </FormControl>
        </BModal.Body>

        <BModal.Footer>
          <Button onClick={this.handleClose}>Submit</Button>
        </BModal.Footer>
      </BModal>;
    } else {
      mainPage = <GridView filters={this.state.filters} events={this.state.events} myView={this.state.myView}/>;
    }
    return (
      <div className="App">
        <div>
          <ToolHeader style={{ backgroundColor: '#FFFFFF' }}>
            <ToolHeader.Section>
              <ToolHeader.Header clickable style={{ color: 'black', marginLeft: "10px", cursor: "pointer" }}><img id="logo" src="https://i.imgur.com/hqteaes.png" width="143" height="28"/>Activities</ToolHeader.Header>
            </ToolHeader.Section>

            <FlexList size="sm" style={{ marginTop: "10px", marginBottom: "8px", marginRight: "10px" }}>
              <CreateEventForm refresh={this.refreshEvents}/>
              <AvatarDropDown switchCampus={this.setNoLoc}/>
            </FlexList>
          </ToolHeader>

          <div className="hero-image">
            <div className="hero-text">
              <h1>Get Involved</h1>
            </div>
          </div>
          <br />
        </div>

        <Page>
          <Page.Main>
            <div style={{ backgroundColor: 'white' }}>
              <Tabs className="tabbar">
                <Tabs.Tab active className="tab"><Tabs.Link onClick={() => this.tabClick("all")}>All Events</Tabs.Link></Tabs.Tab>
                <Tabs.Tab className="tab"><Tabs.Link onClick={() => this.tabClick("my")}>My Events</Tabs.Link></Tabs.Tab>
              </Tabs>
              {mainPage}
            </div>
            <CreateTimeCapsule />
          </Page.Main>

          <Page.SidebarState>
            {({ visibility }) =>
              <Page.Sidebar collapsed={!visibility.isVisible} id="sidebar">
                <Sidebar.Content collapsed={!visibility.isVisible}>
                  {/* <Sidebar.Panel>
                    <Sidebar.PanelTitle className="panelTitle">
                    Calendar View
                    </Sidebar.PanelTitle>
                    <Switch checked={this.state.calView} onChange={this.calToggle} />
                  </Sidebar.Panel>
                  <Sidebar.Divider /> */}
                  <Sidebar.Panel>
                    <Sidebar.PanelTitle className="panelTitle">
                      Filters
                    </Sidebar.PanelTitle>
                    <div id="tag_filter">
                      <input type="checkbox" name="sports" value="Sports" onClick={() => this.handleFilterClick('Sports')}/> Sports<br></br>
                      <input type="checkbox" name="outdoors" value="Outdoors" onClick={() => this.handleFilterClick('Outdoors')}/> Outdoors<br></br>
                      <input type="checkbox" name="food" value="Food" onClick={() => this.handleFilterClick('Food')}/> Food<br></br>
                      <input type="checkbox" name="travel" value="Travel" onClick={() => this.handleFilterClick('Travel')}/> Travel<br></br>
                      <input type="checkbox" name="carpool" value="Carpool" onClick={() => this.handleFilterClick('Carpool')}/> Carpool<br></br>
                      <input type="checkbox" name="happy hour" value="Happy Hour" onClick={() => this.handleFilterClick('Happy Hour')}/> Happy Hour<br></br>
                      <input type="checkbox" name="dog friendly" value="Dog-Friendly" onClick={() => this.handleFilterClick('Dog-Friendly')}/> Dog-Friendly<br></br>
                      <input type="checkbox" name="arts and crafts" value="Arts and Crafts" onClick={() => this.handleFilterClick('Arts and Crafts')}/> Arts & Crafts<br></br>
                      <input type="checkbox" name="beach" value="Beach" onClick={() => this.handleFilterClick('Beach')}/> Beach<br></br>
                      <input type="checkbox" name="movies" value="Movies" onClick={() => this.handleFilterClick('Movies')}/> Movies<br></br>
                      <input type="checkbox" name="music" value="Music" onClick={() => this.handleFilterClick('Music')}/> Music<br></br>
                      <input type="checkbox" name="volunteer" value="Volunteer" onClick={() => this.handleFilterClick('Volunteer')}/> Volunteer<br />
                      <input type="checkbox" name="other" value="Other" onClick={() => this.handleFilterClick('Other')}/> Other<br />
                    </div>
                  </Sidebar.Panel>

                </Sidebar.Content>
                <Sidebar.FooterButton onClick={visibility.toggle} collapsed={!visibility.isVisible}>
                  Minimize Sidebar
                </Sidebar.FooterButton>
              </Page.Sidebar>
            }
          </Page.SidebarState>
        </Page>
      </div>
    );
  }
}

export default App;
