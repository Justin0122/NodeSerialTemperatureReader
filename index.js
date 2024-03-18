require('dotenv').config();
const {SerialPort} = require('serialport')
const {ReadlineParser} = require('@serialport/parser-readline')
const db = require('./db/database.js');


const port = new SerialPort({path: '/dev/ttyACM0', baudRate: 9600})
port.on('error', (err) => {
    console.error('Error reading serial port:', err);
});

port.on('open', () => {
    console.log('Serial port open');

});

const parser = port.pipe(new ReadlineParser({delimiter: '\n'}));

parser.on('error', (err) => {
    console.error('Error reading serial port:', err);
});

parser.on('data', async (data) => {
    console.log('Data:', data);
    const sensorsData = data.split(';'); // Split the data by the semicolon to get an array of sensor data
    for (const sensorData of sensorsData) {
        const sensorId = sensorData.split(',')[0];
        const temperature = sensorData.split(',')[1];
        console.log('Sensor ID:', sensorId);
        console.log('Temperature:', temperature);
        try {
            if (!sensorId.match(/^[0-9A-F]{16}$/i)) {
                console.log('Invalid sensor ID:', sensorId);
                continue; // Skip this sensor data and continue with the next one
            }
            //only insert it if it doesn't already exist
            let sensor;
            const sensorExists = await db('sensors').where('name', sensorId);
            if (sensorExists.length === 0) {
                [sensor] = await db('sensors').insert({name: sensorId}).returning('*');
            } else {
                sensor = sensorExists[0];
            }
            //insert the temperature into the temperatures table with the current time
            await db('temperatures').insert({sensor_id: sensor.id, value: temperature, created_at: new Date()});
        } catch (error) {
            console.error('Error inserting sensor and temperature:', error);
        }
    }
});

port.on('error', (err) => {
    console.error('Error reading serial port:', err);
});
