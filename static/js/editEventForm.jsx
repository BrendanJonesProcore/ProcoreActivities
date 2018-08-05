import React, { Component } from 'react';
import { Card, Modal, Button, Notation, Footer, Pagination, Page, Icon } from '@procore/core-react';
import { form, Form, FormGroup, FormControl, ControlLabel, Radio, Checkbox, Alert, Button as BButton } from 'react-bootstrap';
import axios from 'axios';
import '../css/index.css';

class EditEventForm extends Component {
  constructor(props) {
    super(props);
    const event = this.props.event;
    this.state = {
      title: event.name,
      description: event.description,
      tags: { "Sports": true, "Outdoors": true },
      campus: event.campus,
      location: event.location,
      recurring: this.isRecurring(event),
      originallyRecurring: this.isRecurring(event),
      occurrences: event.times.map(time => this.getOccurrences(time)),
      times: event.times,
      noAdditionalOccurrence: true,
      someUpdated: false,
      deletedOccurrences: [],
      addedOccurrences: [],
      event_id: event.event_id,
      googleCalChecked: true
    }
    this.isRecurring = this.isRecurring.bind(this);
    this.getOccurrences = this.getOccurrences.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.updateRecurring = this.updateRecurring.bind(this);
    this.updateFrequencyOccurrence = this.updateFrequencyOccurrence.bind(this);
    this.updateDateOccurrence = this.updateDateOccurrence.bind(this);
    this.updateStartTimeOccurrence = this.updateStartTimeOccurrence.bind(this);
    this.updateEndTimeOccurrence = this.updateEndTimeOccurrence.bind(this);
    this.updateGoogleCalChecked = this.updateGoogleCalChecked.bind(this);
    this.isValidUpdate = this.isValidUpdate.bind(this);
    this.cancelUpdate = this.cancelUpdate.bind(this);
    this.addOccurence = this.addOccurence.bind(this);
    this.deleteOccurrence = this.deleteOccurrence.bind(this);
    this.handleAddedOccurrences = this.handleAddedOccurrences.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  isRecurring(event) {
    return event.times[0].frequency ? true : false
  }
  getOccurrences(time) {
    return {
      frequency: time.frequency,
      date: time.start.substring(0, 10),
      start_time: time.start.substring(11, 16),
      end_time: time.end.substring(11, 16),
      google_calendar_id: time.google_calendar_id,
      schedule_id: time.schedule_id
    }
  }
  updateTitle(event) {
    this.setState({
      title: event.target.value,
      someUpdated: true
    });
  }
  updateDescription(event) {
    this.setState({
      description: event.target.value,
      someUpdated: true
    })
  }
  updateLocation(event) {
    this.setState({
      location: event.target.value,
      someUpdated: true
    })
  }
  updateRecurring(event) {
    var newRecurring = !this.state.recurring;
    var occurrencesUpdated = this.state.occurrences;
    if (newRecurring) {
      occurrencesUpdated[0].frequency = "RRULE:FREQ=WEEKLY";
    } else {
      occurrencesUpdated[0].frequency = "";
    };
    this.setState({
      recurring: newRecurring,
      someUpdated: true,
      occurrences: occurrencesUpdated
    })
  }
  updateFrequencyOccurrence(event, i, isAdded) {
    if (isAdded) {
      var updatedOccurrences = this.state.addedOccurrences;
      updatedOccurrences[i].frequency = event.target.value;
      this.setState({
        addedOccurrences: updatedOccurrences,
        someUpdated: true
      })
    } else {
      var updatedOccurrences = this.state.occurrences;
      updatedOccurrences[i].frequency = event.target.value;
      this.setState({
        occurrences: updatedOccurrences,
        someUpdated: true
      })
    }
  }
  updateDateOccurrence(event, i, isAdded) {
    if (isAdded) {
      var updatedOccurrences = this.state.addedOccurrences;
      updatedOccurrences[i].date = event.target.value;
      this.setState({
        addedOccurrences: updatedOccurrences,
        someUpdated: true
      })
    } else if (event.target.value) {
      var updatedOccurrences = this.state.occurrences;
      updatedOccurrences[i].date = event.target.value;
      this.setState({
        occurrences: updatedOccurrences,
        someUpdated: true
      })
    }
  }
  updateStartTimeOccurrence(event, i, isAdded) {
    if (isAdded) {
      var updatedOccurrences = this.state.addedOccurrences;
      updatedOccurrences[i].start_time = event.target.value;
      this.setState({
        addedOccurrences: updatedOccurrences,
        someUpdated: true
      })
    } else if (event.target.value) {
      var updatedOccurrences = this.state.occurrences;
      updatedOccurrences[i].start_time = event.target.value;
      this.setState({
        occurrences: updatedOccurrences,
        someUpdated: true
      })
    }
  }
  updateEndTimeOccurrence(event, i, isAdded) {
    if (isAdded) {
      var updatedOccurrences = this.state.addedOccurrences;
      updatedOccurrences[i].end_time = event.target.value;
      this.setState({
        addedOccurrences: updatedOccurrences,
        someUpdated: true
      })
    } else if (event.target.value) {
      var updatedOccurrences = this.state.occurrences;
      updatedOccurrences[i].end_time = event.target.value;
      this.setState({
        occurrences: updatedOccurrences,
        someUpdated: true
      })
    }
  }
  updateGoogleCalChecked(isChecked) {
    this.setState({
      googleCalChecked: isChecked
    })
  }
  isValidUpdate(event) {
    if (this.state.title && this.state.description && this.state.location && this.state.someUpdated) {
      if (this.state.recurring) {
        return this.state.noAdditionalOccurrence
      } else {
        return true
      }
    }
    return false
  }
  cancelUpdate(visibility) {
    then(visibility.hide).then(this.clearFields)
  }
  addOccurence() {
    var addedOccurrences = this.state.addedOccurrences;
    var frequency = '';
    if (this.state.recurring) {
      frequency = "RRULE:FREQ=WEEKLY"
    };
    addedOccurrences.push({
      frequency: frequency,
      date: '',
      start_time: '12:00',
      end_time: '13:00'
    });
    this.setState({
      addedOccurrences: addedOccurrences
    })
  }
  deleteOccurrence(index, isAdded) {
    if (isAdded) {
      this.state.addedOccurrences.splice(index, 1);
      this.setState({});
    } else {
      var deletedOccurrences = this.state.deletedOccurrences;
      deletedOccurrences.push(this.state.occurrences[index]);
      this.setState({
        deletedOccurrences: deletedOccurrences,
        someUpdated: true
      });
      this.state.occurrences.splice(index, 1);
      this.setState({});
    }
  }
  handleAddedOccurrences() {
    if (this.state.addedOccurrences) {
      axios({
        method: 'post',
        url: 'api/occurrences/new',
        data: this.state
      })
    }
  }
  handleSubmit(visibility) {
    axios({
      method: 'post',
      url: 'api/events/update',
      data: this.state
    }).then(this.handleAddedOccurrences).then(visibility.hide)
  }
  render() {
    const tags = ["Sports", "Outdoors", "Food", "Travel", "Carpool", "Happy Hour", "Dog-Friendly", "Arts & Crafts", "Beach", "Movies", "Music", "Volunteer", "Other"]
    const blockOne = (
      <div>
        <form>
          <FormGroup>
            <ControlLabel>Event Name:</ControlLabel>
            <FormControl type="text" name="title" value={this.state.title} placeholder="Example: Trail Running" onChange={this.updateTitle} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Event Description:</ControlLabel>
            <FormControl componentClass="textarea" name="description" value={this.state.description} placeholder="Describe your event..." rows='8' cols='50' maxLength={500} onChange={this.updateDescription} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Tags:</ControlLabel>
            {tags.map(tag => this.state.tags[tag] ? <Checkbox name="tags" checked={true} disabled={true} style={{ marginLeft: "10px" }} inline> {tag} </Checkbox> : null)}
          </FormGroup>
        </form>

        <Form inline>
          <FormGroup>
            <ControlLabel>Campus Location:</ControlLabel>
            <FormControl.Static style={{ marginLeft: "10px" }}>{displayCampus(this)}</FormControl.Static>
          </FormGroup>
        </Form>

        <form>
          <FormGroup>
            <ControlLabel>Event Location:</ControlLabel>
            <FormControl type="text" name="location" value={this.state.location} onChange={this.updateLocation} />
          </FormGroup>
        </form>
      </div>
    )
    function displayCampus(self) {
      const campus = self.state.campus;
      if (campus == "carpinteria_ca") { return "Carpinteria, CA" }
      else if (campus == "austin_tx") { return "Austin, TX" }
      else if (campus == "new_york") { return "New York, NY" }
      else if (campus == "portland_or") { return "Portland, OR" }
      else if (campus == "san_diego_ca") { return "San Diego, CA" }
      else if (campus == "san_francisco_ca") { return "San Francisco, CA" }
      else if (campus == "willmar_mn") { return "Willmar, MN" }
      else if (campus == "london_uk") { return "London, United Kingdom" }
      else if (campus == "sydney_au") { return "Sydney, Australia" }
      else if (campus == "toronto_ca") { return "Toronto, Canada" }
      else if (campus == "vancouver_ca") { return "Vancouver, Canada" }
      else { return "Carpinteria, CA" }
    }
    const makeRecurringCheck = (
      <form>
        <FormGroup>
          <Checkbox name="recurring" checked={this.state.recurring} onChange={this.updateRecurring} inline>
            Make this a recurring event?
          </Checkbox>
        </FormGroup>
      </form>
    )
    function showFrequency(self, occurrence, i, isAdded) {
      return (
        <form>
          <FormGroup>
            <ControlLabel>Select Event Frequency:</ControlLabel>
            <FormControl componentClass="select" value={occurrence.frequency} onChange={(e) => self.updateFrequencyOccurrence(e, i, isAdded)}>
              <option disabled='true' value=''>Select</option>
              <option value="RRULE:FREQ=DAILY">Daily</option>
              <option value="RRULE:FREQ=WEEKLY">Weekly</option>
              <option value="RRULE:FREQ=WEEKLY;INTERVAL=2">Biweekly (every other week)</option>
              <option value="RRULE:FREQ=MONTHLY">Monthly</option>
            </FormControl>
          </FormGroup>
        </form>
      )
    }
    function showOccurence(self, occurrence, i, isAdded) {
      var instanceNum = '';
      if (occurrence.frequency) {
        if (isAdded) {
          instanceNum = i + 1 + self.state.occurrences.length + '. ';
        } else {
          instanceNum = i + 1 + '. ';
        }
      }
      return (
        <div>
          <br />
          <Form inline>
            <FormGroup>
              <ControlLabel>{instanceNum}Date:</ControlLabel>
              <FormControl type="date" name="date" value={occurrence.date} style={{ marginLeft: "5px", marginBottom: "5px" }} onChange={(e) => self.updateDateOccurrence(e, i, isAdded)} />
            </FormGroup>
          </Form>

          <Form inline>
            <FormGroup>
              <ControlLabel>Start Time:</ControlLabel>
              <FormControl type="time" name="start_time" value={occurrence.start_time} style={{ marginLeft: "5px", marginRight: "10px" }} onChange={(e) => self.updateStartTimeOccurrence(e, i, isAdded)} />
            </FormGroup>

            <FormGroup>
              <ControlLabel>End Time:</ControlLabel>
              <FormControl type="time" name="end_time" value={occurrence.end_time} style={{ marginLeft: "5px" }} onChange={(e) => self.updateEndTimeOccurrence(e, i, isAdded)} />
            </FormGroup>
          </Form>

          {occurrence.frequency ? showFrequency(self, occurrence, i, isAdded) : null}

          <BButton bsStyle="danger" style={{ marginTop: "5px" }} onClick={() => self.deleteOccurrence(i, isAdded)}>Delete Time</BButton>
        </div>
      )
    }
    function showAddToCal(self) {
      return (
        <form>
          <FormGroup>
            <br />
            <Checkbox name="addToGoogleCal" checked={self.state.googleCalChecked} onChange={self.updateGoogleCalChecked.bind(self, !self.state.googleCalChecked)} inline>
              Add to Google Calendar?
            </Checkbox>
          </FormGroup>
        </form>
      )
    }

    const emptyOccurrence = { frequency: '', date: '', start_time: '00:00', end_time: '01:00' }

    return (
      <Modal.State>
        {({ visibility }) => (
          <div>
            <Button variant="secondary" onClick={visibility.show}>Edit</Button>

            <Modal open={visibility.isVisible} onClickOverlay={visibility.hide}>
              <Modal.Header className="modalHeader" onClose={visibility.hide}>Edit Activity</Modal.Header>

              <Modal.Body>
                {blockOne}
                {this.state.originallyRecurring ? null : makeRecurringCheck}
                {this.state.occurrences.map((occurrence, i) => showOccurence(this, occurrence, i, false))}
                {this.state.addedOccurrences.map((occurrence, i) => showOccurence(this, occurrence, i, true))}
                <br />
                <Button onClick={this.addOccurence.bind(this)}>Add Another Time</Button>
                {this.state.addedOccurrences.length > 0 ? showAddToCal(this) : null}
              </Modal.Body>

              <Modal.Footer>
                <Modal.FooterNotation>
                  <Button variant="tertiary" onClick={visibility.hide}>
                    Cancel
                  </Button>
                </Modal.FooterNotation>

                <Modal.FooterButtons>
                  <Button variant="primary" disabled={!this.isValidUpdate()} onClick={this.handleSubmit.bind(this, visibility)}>
                    Save Edits
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
export default EditEventForm;
