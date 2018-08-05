import React, { Component } from 'react';
import { Card, Modal, Button, Notation, Footer, Pagination, Page, Icon } from '@procore/core-react';
import { form, Form, FormGroup, FormControl, ControlLabel, Radio, Checkbox, Alert, Button as BButton } from 'react-bootstrap';
import axios from 'axios';
import '../css/index.css';

class CreateEventForm extends Component {
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
      start_time: '12:00',
      end_time: '13:00',
      googleCalChecked: true,
      occurrences: [],
      savedAtLeastOnce: false
    }
    this.updateTitle = this.updateTitle.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.updateTags = this.updateTags.bind(this);
    this.updateCampus = this.updateCampus.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.updateRecurring = this.updateRecurring.bind(this);
    this.updateFrequency = this.updateFrequency.bind(this);
    this.updateDate = this.updateDate.bind(this);
    this.updateStartTime = this.updateStartTime.bind(this);
    this.updateEndTime = this.updateEndTime.bind(this);
    this.updateGoogleCalChecked = this.updateGoogleCalChecked.bind(this);
    this.isValidCreate = this.isValidCreate.bind(this);
    this.saveInstance = this.saveInstance.bind(this);
    this.clearFields = this.clearFields.bind(this);
    this.cancelCreate = this.cancelCreate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteOccurrence = this.deleteOccurrence.bind(this);
  }

  formatOcur(ocur) {
    var freq = "";

    if (ocur.frequency == "RRULE:FREQ=WEEKLY") {
      freq = "Weekly";
    } else if (ocur.frequency == "RRULE:FREQ=WEEKLY;INTERVAL=2") {
      freq = "Biweekly";
    } else if (ocur.frequency == "RRULE:FREQ=MONTHLY") {
      freq = "Monthly";
    } else {
      freq = "Daily";
    }

    return (ocur.date + ", from " + this.formatTime(ocur.start_time) +
      " to " + this.formatTime(ocur.end_time) + ", " + freq);
  }

  formatTime(time) {
    var hour = parseInt(time.substring(0, 2));
    if (hour == 0) {
      return "12" + time.substring(2) + " AM";
    } else if (hour < 12) {
      return time + " AM";
    } else {
      if (hour == 12) {
        return time + " PM";
      } else {
        return (hour - 12) + time.substring(2) + " PM";
      }
    }
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
  updateTags(event) {
    const tag = event.target.value
    var updatedTags = this.state.tags
    if (updatedTags[tag]) {
      delete updatedTags[tag]
    } else {
      updatedTags[tag] = true
    }
    this.setState({
      tags: updatedTags
    })
  }
  updateCampus(event) {
    this.setState({
      campus: event.target.value
    })
  }
  updateLocation(event) {
    this.setState({
      location: event.target.value
    })
  }
  updateRecurring(isRecurring) {
    this.setState({
      recurring: isRecurring
    })
  }
  updateFrequency(event) {
    this.setState({
      frequency: event.target.value
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
    if (this.state.title && this.state.description && Object.keys(this.state.tags).length > 0
      && this.state.campus && this.state.location) {
      if (this.state.recurring) {
        return this.state.savedAtLeastOnce || (this.state.frequency && this.state.date) ? true : false
      } else {
        return this.state.date && this.state.start_time && this.state.end_time ? true : false
      }
    }
    return false
  }
  saveInstance(event) {
    var updatedOccurrences = this.state.occurrences;
    updatedOccurrences.push({
      frequency: this.state.frequency,
      date: this.state.date,
      start_time: this.state.start_time,
      end_time: this.state.end_time
    });
    this.setState({
      frequency: '',
      date: '',
      start_time: '00:00',
      end_time: '01:00',
      occurrences: updatedOccurrences,
      savedAtLeastOnce: true
    })
  }
  clearFields(event) {
    this.setState({
      title: '',
      description: '',
      tags: {},
      campus: '',
      location: '',
      recurring: false,
      frequency: '',
      date: '',
      start_time: '12:00',
      end_time: '13:00',
      googleCalChecked: true,
      occurrences: [],
      savedAtLeastOnce: false
    })
  }
  cancelCreate(visibility) {
    then(visibility.hide).then(this.clearFields)
  }
  handleSubmit(visibility) {
    axios({
      method: 'post',
      url: 'api/events/new',
      data: this.state
    }).then(visibility.hide)
      .then(this.clearFields).then(this.props.refresh)
  }
  deleteOccurrence(index) {
    this.state.occurrences.splice(index, 1);
    this.setState({});
  }
  render() {
    const tags = ["Sports", "Outdoors", "Food", "Travel", "Carpool", "Happy Hour", "Dog-Friendly", "Arts & Crafts", "Beach", "Movies", "Music", "Volunteer", "Other"]
    const blockOne = (
      <form>
        <FormGroup>
          <ControlLabel>Event Name:</ControlLabel>
          <FormControl type="text" name="title" value={this.state.title} placeholder="Example: Trail Running" maxLength={25} onChange={this.updateTitle} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Event Description:</ControlLabel>
          <FormControl componentClass="textarea" name="description" value={this.state.description} placeholder="Describe your event..." rows='8' cols='50' maxLength={500} onChange={this.updateDescription} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Tags:</ControlLabel>
          {tags.map(tag => <Checkbox name="tags" checked={this.state.tags[tag] ? true : false} value={tag} style={{ marginLeft: "10px" }} onChange={this.updateTags} inline> {tag} </Checkbox>)}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Campus Location:</ControlLabel>
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
        </FormGroup>

        <FormGroup>
          <ControlLabel>Event Location:</ControlLabel>
          <FormControl type="text" name="location" value={this.state.location} onChange={this.updateLocation} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Is this a recurring event?</ControlLabel>
          <Radio name="recurring" checked={this.state.recurring} style={{ marginLeft: "20px" }} onChange={this.updateRecurring.bind(this, true)} inline>
            Yes
          </Radio>
          <Radio name="recurring" checked={!(this.state.recurring)} style={{ marginLeft: "20px" }} onChange={this.updateRecurring.bind(this, false)} inline>
            No
          </Radio>
        </FormGroup>
      </form>
    )
    var savedTimes = <div></div>
    if (this.state.occurrences.length > 0) {
      savedTimes =
        <div>
          <ControlLabel>Saved Times:</ControlLabel>
          <br />
          {this.state.occurrences.map((item, index) => (
            <div key={index}>
              <FormControl.Static>{this.formatOcur(item)}</FormControl.Static>
              <BButton onClick={() => this.deleteOccurrence(index)}>Delete Time</BButton>
            </div>
          ))}
          <br></br>
          <ControlLabel>Add Another Time:</ControlLabel>
        </div>
    }
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
    const showFrequency = (
      <div>
        <form>
          <FormGroup>
            <ControlLabel>Select Event Frequency:</ControlLabel>
            <FormControl componentClass="select" value={this.state.frequency} onChange={this.updateFrequency}>
              <option disabled='true' value=''>Select</option>
              <option value="RRULE:FREQ=DAILY">Daily</option>
              <option value="RRULE:FREQ=WEEKLY">Weekly</option>
              <option value="RRULE:FREQ=WEEKLY;INTERVAL=2">Biweekly (every other week)</option>
              <option value="RRULE:FREQ=MONTHLY">Monthly</option>
            </FormControl>
          </FormGroup>
        </form>
      </div>
    )
    const showSave = (
      <div>
        <br />
        <Button disabled={!(this.isValidCreate() && this.state.date && this.state.frequency)} onClick={this.saveInstance.bind(this)}>Save Time</Button>
      </div>
    )

    return (
      <Modal.State>
        {({ visibility }) => (
          <div>
            <Button id="create_button" icon="create" onClick={visibility.show}>Create Activity</Button>

            <Modal open={visibility.isVisible} onClickOverlay={visibility.hide}>
              <Modal.Header className="modalHeader" onClose={visibility.hide}>Create Activity</Modal.Header>

              <Modal.Body>
                {blockOne}
                {savedTimes}
                {this.state.recurring ? showFrequency : null}
                {addDateAndTime}
                {this.state.recurring ? showSave : null}
                <br />

                <form>
                  <FormGroup>
                    <br />
                    <Checkbox name="addToGoogleCal" checked={this.state.googleCalChecked} onChange={this.updateGoogleCalChecked.bind(this, !this.state.googleCalChecked)} inline>
                      Add to Google Calendar?
                    </Checkbox>
                  </FormGroup>
                </form>
              </Modal.Body>

              <Modal.Footer>
                <Modal.FooterNotation>
                  <Button variant="tertiary" onClick={visibility.hide}>
                    Cancel
                  </Button>
                </Modal.FooterNotation>

                <Modal.FooterButtons>
                  <Button variant="primary" disabled={!this.isValidCreate()} onClick={this.handleSubmit.bind(this, visibility)}>
                    Submit
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
export default CreateEventForm;
