import React, { Component } from 'react';
import { Modal, Button } from '@procore/core-react';
import { Grid, Col, Row, Modal as BModal, FormControl, Button as BButton } from 'react-bootstrap';
import EditEventForm from './editEventForm';
import JoinEventForm from './joinForm';
import '../css/index.css';
var randomColor = require('randomcolor');
import axios from 'axios';

class GridView extends Component {

  constructor(props) {
    super(props);
    this.createMatrix = this.createMatrix.bind(this);
    this.state = {
      campus: '',
      noLoc: this.props.noLoc,
    };

  }

  handleLeave(id, visibility) {
    console.log("leaving " + id + "!");
    axios({
      method: 'post',
      url: 'api/events/leave_event',
      data: { event_id: id }
    }).then(visibility.hide)
  }

  createMatrix(events) {
    var elements = []
    var filterevents;

    if (this.props.filters.length < 1) {
      filterevents = events;
      if (this.props.myView) {
        filterevents = events.filter((event) => event.user_interested);
      }
    } else {
      filterevents = [];
      for (var a = 0; a < events.length; a++) {
        if (this.props.myView && !events[a].user_interested)
          break
        for (var i = 0; i < this.props.filters.length; i++) {
          if (events[a].tags.includes(this.props.filters[i])) {
            filterevents.push(events[a]);
            break
          }
        }
      }
    }

    for (var i = 0; i < filterevents.length; i += 3) {
      elements.push(
        <Row>
          {this.createRowCard(i, filterevents)}
        </Row>
      )
    }

    return elements
  }

  createRowCard(i, events) {

    var row = [this.createCard(events[i])]

    if (events.length % 3 == 0 || i < events.length - (events.length % 3)) {
      row.push(this.createCard(events[i + 1]))
      row.push(this.createCard(events[i + 2]))
      return row
    } else if (events.length % 3 > 1) {
      row.push(this.createCard(events[i + 1]))
    } else {
      row.push(<Col sm={4} md={4}>{}</Col>)
    }

    row.push(<Col sm={4} md={4}>{}</Col>)
    return row
  }

  createTimes(item, purpose) {
    var htmlTags = []

    // if (purpose == "card") {
    //   for (var i = 0; i < item.times.length; i++) {
    //     htmlTags.push(<h3>{item.times[i]['time_string']}</h3>)
    //   }
    // }

    // else if (purpose == "event") {
    //   for (var i = 0; i < item.times.length; i++) {
    //     htmlTags.push(<p class="eventModalText">{item.times[i]['time_string']}</p>)
    //   }
    // }

    return htmlTags
  }

  createCard(item) {
    var cardcolor = randomColor({ luminosity: 'dark' });
    var borderstyle = {
      color: cardcolor,
      borderTop: "1px solid darkgray"
    }
    const interested = item.user_interested;
    var areYouSure =
      <Modal.State>
        {({ visibility }) => (
          <div>
            <Button onClick={visibility.show}>Edit</Button>

            <Modal open={visibility.isVisible} onClickOverlay={visibility.hide}>
              <Modal.Header onClose={visibility.hide}>
                Are you sure you want to edit this event for all users?
              </Modal.Header>

              <Modal.Footer>
                <Modal.FooterNotation>
                  <Button>No</Button>
                </Modal.FooterNotation>

                <Modal.FooterButtons>
                  <EditEventForm refresh={this.props.refresh} event={item} />
                </Modal.FooterButtons>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </Modal.State>;
    var bButton;
    if (item.user_interested) {
      bButton = areYouSure
    } else {
      bButton = <JoinEventForm event={item} />
    }

    return (
      <Col sm={4} md={4}>
        <Modal.State>
          {({ visibility }) => (
            <div>
              <div class="singleCard" style={{ backgroundColor: cardcolor }} onClick={visibility.show}>
                <h1> {item.name} </h1>
                {item.times.map((name, i) => i >= 2 ? null : <h3 key={i}>{name.time_string}</h3>)}
              </div>

              <Modal open={visibility.isVisible} onClickOverlay={visibility.hide} className="eventModal">
                <Modal.Header onClose={visibility.hide} style={{ color: cardcolor }}><h1 id="eventModalTitle" >{item.name}</h1></Modal.Header>

                <Modal.Body>
                  <h3 style={{ color: cardcolor }}>🗒 Description</h3>
                  <p class="eventModalText">{item.description}</p>
                  <br></br>
                  <h3 style={borderstyle}>📍 Location</h3>
                  <p class="eventModalText">{item.location}</p>
                  <br></br>
                  <h3 style={borderstyle}>⏱ Time</h3>
                  {item.times.map((name, i) =>
                    <p class="eventModalText" key={i}>{name.time_string}</p>
                  )}
                  <br />
                  <h3 style={borderstyle}>🏷 Tags</h3>
                  <p class="eventModalText">{item.tags.join(", ")}</p>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.FooterNotation>
                    {interested &&
                      <BButton bsStyle="danger" onClick={() => this.handleLeave(item.event_id, visibility)}>Leave Event</BButton>}
                  </Modal.FooterNotation>

                  <Modal.FooterButtons>
                    {bButton}
                  </Modal.FooterButtons>
                </Modal.Footer>
              </Modal>
            </div>
          )}
        </Modal.State>
      </Col>
    )
  }

  render() {
    var events = this.props.events;

    return (
      <div className="divGrid">
        <Grid>
          {this.createMatrix(events)}
        </Grid>
      </div>
    )
  }
}
export default GridView;
