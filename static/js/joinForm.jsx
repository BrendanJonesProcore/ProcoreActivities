import React, { Component } from 'react';
import { Modal, Button} from '@procore/core-react';
import { form, Form, FormGroup, FormControl, ControlLabel, Radio, Checkbox } from 'react-bootstrap';
import axios from 'axios';
import '../css/index.css';

class JoinEventForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            times: {}
        };

        this.updateTags = this.updateTags.bind(this);
    }

  updateTags(event) {
    const tag = event.target.value
    var updatedTags = this.state.times
    if (updatedTags[tag]) {
      delete updatedTags[tag]
    } else {
      updatedTags[tag] = true
    }
    this.setState({
      tags: updatedTags
    })
  }

  handleJoin(visibility) {
      const joindata = {
          event_id: this.props.event.event_id,
          calendar_ids: Object.keys(this.state.times)
      }
      console.log(joindata);
      axios({
        method: 'post',
        url: 'api/events/add_interest',
        data: joindata
      }).then(visibility.hide).then(this.props.refresh)
  }

render() {
    return (
        <Modal.State>
        {({visibility}) => (
          <div>
            <Button classId="joinButton" onClick={ visibility.show }>Join</Button>
            
            <Modal open={ visibility.isVisible } onClickOverlay={ visibility.hide }>
            <Modal.Header className="modalHeader" onClose={ visibility.hide }>Join {this.props.event.name}</Modal.Header>
              <Modal.Body>
            <FormGroup>
            <ControlLabel>Choose times to add to your calendar:</ControlLabel>
            { this.props.event.times.map(time => 
                <Checkbox name="tags" checked={this.state.times[time.google_calendar_id] ? true : false} 
                value={time.google_calendar_id} onChange={this.updateTags}> {time.time_string} </Checkbox>) }
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => {this.handleJoin(visibility)}}>Join Event</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )}
    </Modal.State>
    )
}
}

export default JoinEventForm;