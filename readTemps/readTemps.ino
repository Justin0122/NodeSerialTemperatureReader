#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

int numberOfDevices;
DeviceAddress tempDeviceAddress;

void setup() {
  Serial.begin(9600); // Baud rate 9600
  sensors.begin();
  numberOfDevices = sensors.getDeviceCount();
  Serial.print("Locating devices... Found ");
  Serial.print(numberOfDevices);
  Serial.println(" devices.");

  for (int i = 0; i < numberOfDevices; i++) {
    if (sensors.getAddress(tempDeviceAddress, i)) {
      Serial.print("Found device ");
      Serial.print(i);
      Serial.print(" with address: ");
      printAddress(tempDeviceAddress);
      Serial.println();

      // Set the resolution to 12 bits for better accuracy
      sensors.setResolution(tempDeviceAddress, 12);
    } else {
      Serial.print("Found ghost device at ");
      Serial.print(i);
      Serial.print(" but could not detect address. Check power and cabling");
    }
  }
}

void loop() {
  sensors.requestTemperatures();

  String sensorData = ""; // Initialize an empty string to accumulate the sensor data

  for (int i = 0; i < numberOfDevices; i++) {
    if (sensors.getAddress(tempDeviceAddress, i)) {
      float tempC = sensors.getTempC(tempDeviceAddress);
      // Add the device address (UUID) to the sensorData string
      for (uint8_t i = 0; i < 8; i++) {
        if (tempDeviceAddress[i] < 16) sensorData += "0";
        sensorData += String(tempDeviceAddress[i], HEX);
      }
      sensorData += ",";
      sensorData += String(tempC);
      sensorData += ";";
    }
  }
  sensorData.remove(sensorData.length() - 1); // Remove the trailing semicolon
  Serial.println(sensorData); // Send the sensor data

  delay(5000); // Update every 5 seconds
}

void printAddress(DeviceAddress deviceAddress) {
  for (uint8_t i = 0; i < 8; i++) {
    if (deviceAddress[i] < 16) Serial.print("0");
    Serial.print(deviceAddress[i], HEX);
  }
}
