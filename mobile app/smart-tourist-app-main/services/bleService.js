// import { BleManager } from 'react-native-ble-plx';

// export class BLEService {
//   constructor() {
//     this.manager = new BleManager();
//     this.device = null;
//     this.characteristic = null;
//     this.onDataReceived = null;
//     this.isConnected = false;
//   }

//   // UUIDs (must match your ESP32 code)
//   static SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
//   static CHARACTERISTIC_UUID = '12345678-1234-1234-1234-123456789def';
//   static DEVICE_NAME = 'ESP32_SimpleInt';

//   // Scan for ESP32 device
//   async scanForDevice() {
//     return new Promise((resolve, reject) => {
//       this.manager.startDeviceScan(null, null, (error, device) => {
//         if (error) {
//           this.manager.stopDeviceScan();
//           reject(error);
//           return;
//         }

//         if (device.name === this.DEVICE_NAME) {
//           this.manager.stopDeviceScan();
//           console.log('Found ESP32:', device.id);
//           resolve(device);
//         }
//       });
//     });
//   }

//   // Connect to ESP32
//   async connectToDevice(device) {
//     try {
//       this.device = await device.connect();
//       await this.device.discoverAllServicesAndCharacteristics();
      
//       // Enable notifications
//       this.characteristic = await this.device.writeCharacteristicWithResponseForService(
//         this.SERVICE_UUID,
//         this.CHARACTERISTIC_UUID,
//         'AQ==' // 0x01 in base64 - enable notifications
//       );

//       // Monitor for data
//       this.monitorCharacteristic();
      
//       this.isConnected = true;
//       console.log('Connected to ESP32');
//       return true;
//     } catch (error) {
//       console.error('Connection error:', error);
//       throw error;
//     }
//   }

//   // Monitor characteristic for data
//   monitorCharacteristic() {
//     this.device.monitorCharacteristicForService(
//       this.SERVICE_UUID,
//       this.CHARACTERISTIC_UUID,
//       (error, characteristic) => {
//         if (error) {
//           console.error('Monitoring error:', error);
//           return;
//         }

//         if (characteristic?.value) {
//           this.handleIncomingData(characteristic.value);
//         }
//       }
//     );
//   }

//   // Handle incoming BLE data
//   handleIncomingData(base64Value) {
//     try {
//       // Convert base64 to byte array
//       const rawData = atob(base64Value);
//       const heartRate = rawData.charCodeAt(0); // Your ESP32 sends integer value
      
//       // Simulate crash detection (you'll need to modify ESP32 to send more data)
//       const crashDetected = heartRate > 140 || heartRate < 50; // Emergency thresholds
      
//       const sensorData = {
//         deviceId: this.DEVICE_NAME,
//         heartbeat: heartRate,
//         crash: crashDetected,
//         timestamp: new Date().toISOString()
//       };

//       console.log('BLE Data received:', sensorData);

//       // Forward to server
//       this.sendToServer(sensorData);

//       // Notify UI
//       if (this.onDataReceived) {
//         this.onDataReceived(sensorData);
//       }
//     } catch (error) {
//       console.error('Data processing error:', error);
//     }
//   }

//   // Send data to your server
//   async sendToServer(sensorData) {
//     try {
//       const response = await fetch('http://10.15.62.245:5000/api/sensor/sensor-data', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(sensorData)
//       });
      
//       const result = await response.json();
//       console.log('Data sent to server:', result);
//     } catch (error) {
//       console.error('Server communication error:', error);
//     }
//   }

//   // Disconnect
//   async disconnect() {
//     if (this.device) {
//       await this.device.cancelConnection();
//       this.device = null;
//       this.characteristic = null;
//       this.isConnected = false;
//     }
//   }

//   // Check Bluetooth state
//   async checkBluetoothState() {
//     const state = await this.manager.state();
//     return state === 'PoweredOn';
//   }
// }

// export const bleService = new BLEService();