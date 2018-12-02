import React, { Component } from 'react';
// import { Tabs, Tab } from 'react-bootstrap';
import { Container,  Row, Col, 
  Card, CardImg, CardText, CardHeader, CardFooter, CardBody, CardColumns,
  CardTitle, CardSubtitle, Button,ButtonGroup,
   Modal, ModalHeader, ModalBody, ModalFooter,
   Progress,Jumbotron,
    Form, FormGroup, Label, Input, FormText, Alert   } from 'reactstrap';

import 'whatwg-fetch';
import config from './config.js';
import './index.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tx: [],
      loadingTx: false,
      isOpen: false,
      isFormOpen:false,
      editMode:false,
      taskName:'',
      dueDate:'',
      dueTime:'',
      status:'Open',
      instructions:'',
      error:'',
      success:false
    };
   // this.openModal = this.openModal.bind(this)
    this.openAddModal = this.openAddModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    var url = config.API_URL+'tasks';
    fetch(url,{}).then(res => res.json())
    .then(json => {
      console.log('enter',json);
      this.setState({
        tx: json.tasks,
        loadingTx:false
      });
    }, error =>{
      console.log('err',error);
    });
  }

  openModal (id) {
    this.setState({
       isOpen: {
          [id]: !this.state.isOpen[id]
       }
    });
  }  

  openAddModal () {
    this.setState({
       isFormOpen: !this.state.isFormOpen
    });
  }

  openEditModal (data) {
    console.log(data);
    let dueDateArr = data.due.split(" ");
    this.setState({
       isFormOpen: !this.state.isFormOpen,
       editMode:true,
       taskName:data["task-name"],
       status:data.status,
       dueDate:dueDateArr[0],
       dueTime:dueDateArr[1],
       instructions:data.instructions
    });
  }  

  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  handleSubmit(event) {
    let method = 'POST';
    let url = config.API_URL+'tasks/';
    if(this.state.editMode){
      method = 'POST';
      url = config.API_URL+'tasks/'+this.state.taskName;
    }

    event.preventDefault();  
    this.setState({
      error: '',
      success:false
    });  
    fetch(url, { 
        method: method,
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          'task-name': this.state.taskName,
          'due': this.state.dueDate+' '+this.state.dueTime,
          'status': this.state.status,
          'instructions': this.state.instructions,
        }) 
    })
    .then(res => res.json())
    .then(json => {
      console.log('res',json);
      if(json.error !== undefined && json.error !== ''){
        console.log('error',json.error);
        this.setState({
          error: json.error  
        });  
      }
      else if(json._id !== undefined && json._id !== ''){
        this.setState({
          success: true
        });
      }
      else{
        this.setState({
          error: 'Request Error!'
        });  
      }
    }, error =>{
      this.setState({
        error: error  
      });
      console.log('err',error);
    });
  }

  
  render() {
    const closeBtn = <button className="close" onClick={this.openAddModal}>&times;</button>;
    
    return (
      <>
      <Jumbotron style={{ backgroundColor: 'rgb(255, 254, 210)', padding: '25px'}}> 
        <h1>Teacher Assignment 
          <Button className="float-right" color="warning" size="lg" onClick={this.openAddModal}>Add New</Button>
        </h1>
        
      </Jumbotron>

      <Container>
      <div>
        
        { this.state.tx && this.state.tx.length > 0 &&
          <CardColumns>
          { this.state.tx.map((txSingle, i) => (
            <Card key={i} body inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
              <CardTitle>{txSingle["task-name"]} 
                <span  className={"float-right " + (txSingle.status == 'Open' ? 'text-success' : 'text-danger')}>
                  {txSingle.status}</span>
              </CardTitle>
              <CardSubtitle>{txSingle.due}</CardSubtitle>
              
              <Modal isOpen={this.state.isOpen[i]} toggle={this.openModal.bind(this, i)} className={this.props.className}>
                <ModalHeader toggle={this.openModal.bind(this, i)} onClick={this.openModal.bind(this, i)} >{txSingle["task-name"]}</ModalHeader>
                <ModalBody>{txSingle.instructions}</ModalBody>
                <ModalFooter>
                  <Button size="sm" color="secondary" onClick={this.openModal.bind(this, i)}>Close</Button>
                </ModalFooter>
              </Modal>
              <CardFooter>
              <ButtonGroup className="float-right"  >
              <Button size="sm" color="secondary" onClick={this.openModal.bind(this, i)}>Delete</Button>
              <Button size="sm" color="info" onClick={this.openEditModal.bind(this, txSingle)}>Edit</Button>
              <Button size="sm" color="primary" onClick={this.openModal.bind(this, i)}>View</Button>
              </ButtonGroup>
              </CardFooter>
            </Card>))
          }
          </CardColumns>
        }
      </div>  
      </Container>

      <Modal isOpen={this.state.isFormOpen} toggle={this.openAddModal} className={this.props.className}>
        <ModalHeader toggle={this.openAddModal} close={closeBtn}>Add Asignment</ModalHeader>
        <ModalBody>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup row>
              <Label for="taskName" sm={3}>Task Name</Label>
              <Col sm={9}>
                <Input value={this.state.taskName} onChange={this.handleChange} type="text" name="taskName" id="taskName" placeholder="Enter task name" />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="dueDate" sm={3}>Due</Label>
              <Col sm={9}>
                <Input value={this.state.dueDate} onChange={this.handleChange} type="date" name="dueDate" id="dueDate" placeholder="Enter due date" />
                <Input value={this.state.dueTime} onChange={this.handleChange}  type="time" name="dueTime" id="dueTime" placeholder="Enter due time" />
              </Col>
            </FormGroup>
            <FormGroup tag="fieldset" row>
              <Label for="status" sm={3}>Status</Label>
              <Col sm={9}>
                <Input value={this.state.status} onChange={this.handleChange} type="select" name="status" id="status">
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </Input>
             </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="instructions" sm={3}>Instructions</Label>
              <Col sm={9}>
                <Input value={this.state.instructions} onChange={this.handleChange} type="textarea" name="instructions" id="instructions" />
              </Col>
            </FormGroup>
            {this.state.error !== '' && <Alert color="warning">Error: {this.state.error}</Alert>}
            {this.state.success && <Alert color="success">Successfully Added</Alert>}  
            <FormGroup check row>
              <Col sm={{ size: 12}}>
                <Button className="float-right">Submit</Button>
                <Button color="secondary" onClick={this.openAddModal}>Close</Button>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
      </Modal>
      </>
    );
  }
}

export default App;

