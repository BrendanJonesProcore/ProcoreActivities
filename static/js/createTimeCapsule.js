import React, { Component } from 'react';
import { Card, Modal, Button, Notation, Footer, Pagination, Page, Icon } from '@procore/core-react';
import { form, Form, FormGroup, FormControl, ControlLabel, Radio, Checkbox } from 'react-bootstrap';
import axios from 'axios';
import '../css/index.css';

class CreateTimeCapsule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      tags: {},
      campus: '',
      location: '',
      recurring: false,
      frequency: '',
      date: '',
      start_time: '00:00',
      end_time: '01:00',
      googleCalChecked: true,
      occurrences: []
    }
    this.updateTitle = this.updateTitle.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.updateDate = this.updateDate.bind(this);
    this.updateStartTime = this.updateStartTime.bind(this);
    this.updateEndTime = this.updateEndTime.bind(this);
    this.isValidCreate = this.isValidCreate.bind(this);
    this.clearFields = this.clearFields.bind(this);
    this.cancelCreate = this.cancelCreate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  updateTitle(event) {
    this.setState({
      title: event.target.value
    });
  }
  updateDescription(event) {
    this.setState({
      description: event.target.value
    })
  }
  updateDate(event) {
    this.setState({
      date: event.target.value.toString()
    })
  }
  updateStartTime(event) {
    this.setState({
      start_time: event.target.value.toString()
    })
  }
  updateEndTime(event) {
    this.setState({
      end_time: event.target.value.toString()
    })
  }
  updateGoogleCalChecked(isChecked) {
    this.setState({
      googleCalChecked: isChecked
    })
  }
  isValidCreate(event) {
    if (this.state.title && this.state.description && this.state.date) {
      return true
    }
    return false
  }
  clearFields(event) {
    this.setState({
      title: '',
      description: '',
      date: '',
      start_time: '12:00',
      end_time: '13:00',
      googleCalChecked: true,
    })
  }
  cancelCreate(visibility) {
    this.clearFields;
    visibility.hide
  }
  handleSubmit(visibility) {
    axios({
      method: 'post',
      url: 'api/capsule/new',
      data: this.state
    }).then(visibility.hide)
    .then(this.clearFields)
  }
  render() {
    const blockOne = (
      <form>
        <FormGroup>
          <ControlLabel>Time Capsule Name:</ControlLabel>
          <FormControl type="text" name="title" value={this.state.title} placeholder="Example: Procorians of the Future" onChange={this.updateTitle} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Time Capsule Message:</ControlLabel>
          <FormControl componentClass="textarea" name="description" value={this.state.description} placeholder="Describe your time capsule..." rows='8' cols='50' maxLength={500} onChange={this.updateDescription} />
        </FormGroup>
      </form>
    )
    const addDateAndTime = (
      <div>
        <form>
          <FormGroup>
            <ControlLabel>Date:</ControlLabel>
            <FormControl type="date" name="date" value={this.state.date} onChange={this.updateDate} />
          </FormGroup>
        </form>

        <Form inline>
          <FormGroup>
            <ControlLabel>Start Time:</ControlLabel>
            <FormControl type="time" name="start_time" value={this.state.start_time} style={{ marginLeft: "5px", marginRight: "10px" }} onChange={this.updateStartTime} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>End Time:</ControlLabel>
            <FormControl type="time" name="end_time" value={this.state.end_time} style={{ marginLeft: "5px" }} onChange={this.updateEndTime} />
          </FormGroup>
        </Form>
      </div>
    )

    return (
      <Modal.State>
        {({visibility}) => (
          <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            <Button id="slogan" onClick={visibility.show}>&copy; Built by the people who built the software so you can build the activities that will help build the people that builds the software that builds the world.</Button>

            <Modal open={ visibility.isVisible } onClickOverlay={ visibility.hide }>
              <Modal.Header className="modalHeader" onClose={ visibility.hide }>Create Time Capsule</Modal.Header>

              <Modal.Body>
                {blockOne}
                {addDateAndTime}
              </Modal.Body>

              <Modal.Footer>
                <Modal.FooterNotation>
                  <Button variant="tertiary" onClick={ visibility.hide }>
                    Cancel
                  </Button>
                </Modal.FooterNotation>

                <Modal.FooterButtons>
                  <Button variant="primary" disabled={!this.isValidCreate()} onClick={ this.handleSubmit.bind(this, visibility) }>
                    Create
                  </Button>
                </Modal.FooterButtons>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </Modal.State>
    )
  }
}
export default CreateTimeCapsule;
