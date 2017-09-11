import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      device: null,
      claim: 0
    }
    this.chooseDevice = this.chooseDevice.bind(this);
    this.activeDevice = this.activeDevice.bind(this);
  }

  chooseDevice() {
    let device;
    /// see vendorId in http://www.linux-usb.org/usb.ids
    // this one we focus on 'Alcor Micro Corp.'
    navigator.usb.requestDevice({ filters: [{ vendorId: 0x058f }] })
    .then(selectedDevice => {
      device = selectedDevice
      console.log('ubuntu! with device: ',device);
      return device.open()
    })
    .then(() => device.selectConfiguration(device.configurations[0].configurationValue)) // Select configuration #1 for the device.
    .then(() => device.claimInterface(device.configuration.interfaces[0].interfaceNumber)) // Request exclusive control over interface #2.
    .then(() => device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: 0x22,
        value: 0x01,
        index: 0x02})
      )
      .then(()=> {
        this.setState({device})
      })
    .catch(error => { console.log(error); });
  }

  getDevice() {
    navigator.usb.getDevices().then(devices => {
      devices.map(device => {
        console.log(device);
        return device
      });
    })
  }

  activeDevice() {
    let device = this.state.device;
    device.open().then((res) => {
      console.log(res);
      this.setState({device})
    })
    console.log(this.state.device);
  }

  // issueCommand(commandApdu, callback) {
  //
  //       let buffer;
  //       if (Array.isArray(commandApdu)) {
  //           buffer = new Buffer(commandApdu);
  //       } else if (typeof commandApdu === 'string') {
  //           buffer = new Buffer(hexify.toByteArray(commandApdu));
  //       } else if (Buffer.isBuffer(commandApdu)) {
  //           buffer = commandApdu;
  //       } else if (typeof commandApdu === 'string') {
  //           buffer = new Buffer(hexify.toByteArray(commandApdu));
  //       } else {
  //           buffer = commandApdu.toBuffer();
  //       }
  //
  //       const protocol = this.protocol;
  //
  //       this.emit('command-issued', {card: this, command: commandApdu});
  //       if (callback) {
  //
  //           this.device.transmit(buffer, 0xFF, protocol, (err, response) => {
  //               this.emit('response-received', {
  //                   card: this,
  //                   command: commandApdu,
  //                   response: new ResponseApdu(response)
  //               });
  //               callback(err, response);
  //           });
  //       } else {
  //           return new Promise((resolve, reject) => {
  //               this.device.transmit(buffer, 0xFF, protocol, (err, response) => {
  //                   if (err) reject(err);
  //                   else {
  //                       this.emit('response-received', {
  //                           card: this,
  //                           command: commandApdu,
  //                           response: new ResponseApdu(response)
  //                       });
  //                       resolve(response);
  //                   }
  //               });
  //           });
  //       }
  //   };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>CCID reader</h2>
        </div>
        <p className="App-intro">
          To get started, click <button onClick={this.chooseDevice}>Select Device</button> to select device
        </p>
        <p className="App-intro">
        check devices <button onClick={this.getDevice}>GET DEVICE</button>
        </p>
        {
          this.state.device ? (
            <div>
              <h3>{this.state.device.productName} connected!</h3>
              <h5>Actions</h5>
              <div>Open Session <button onClick={this.activeDevice}>open</button></div>
              <div>Close Session <button onClick={() => this.state.device.close()}>close</button></div>
              <div>select configuartion <button onClick={() => this.state.device.selectConfiguration(1).then((res)=>console.log(res))}>select config</button></div>
              <div>claim interface <input type="number" value={this.state.claim} onChange={e=>this.setState({claim: e.target.value})}/><button onClick={() => this.state.device.claimInterface(1)}>claim interface</button></div>
            </div>
          ) : null
        }
        <button onClick={()=> {
          console.log(this.state.device.transferIn(1,1));
        }}>get data</button>
      </div>
    );
  }
}

export default App;
