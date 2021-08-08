let SerialPort = require('serialport');
let myPort;
let timer = setTimeout(exit, 100);

function exit() {
  console.log('EXITING DUE TO NO RESPONSE.');
  process.exit();
}

function readSerialData(data) {
  console.log(`> ${data}`);
  if (data.match(/[0-9A-F]{32}/) && !data.match(/reply/)) {
    console.error('Matched ID!');
    myPort.write('5');
    clearTimeout(timer);
    timer = setTimeout(exit, 100);
    myPort.write(data.substring(0,21)+'3'+data.substring(21));
  }
  else if (data.indexOf('shared!!!')>0) {
    myPort.write('\r4');
  }
}

function badge(portName) {
  console.log(`Port is ${portName}`);
  myPort = new SerialPort(portName, 9600);
  let Readline = SerialPort.parsers.Readline;
  let parser = new Readline();
  parser.on('data', readSerialData);
  myPort.pipe(parser);
  myPort.write('\n');
  myPort.write('\r');
  myPort.write('4');
}

// list serial ports:
SerialPort.list().then (
  ports => ports.forEach(port =>{
      console.log(JSON.stringify(port));
      if (port.vendorId === 'DC29') {
        console.log('Found a DC29 badge!');
        badge(port.path)}
      }
    ),
  err => console.log(err)
)
