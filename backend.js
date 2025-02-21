import xsensManager, { PAYLOAD_TYPE } from "@vliegwerk/xsens-dot";
import { Server } from "socket.io";

import express from "express";
import { createServer } from "node:http";

const app = express();
const server = createServer(app);
const io = new Server(server);
const payloadType = PAYLOAD_TYPE.completeEuler;

app.use(express.static("./"));
xsensManager.on("dot", async (identifier) => {
  try {
    await xsensManager.connect(identifier);
    await xsensManager.subscribeMeasurement(identifier, payloadType);
    io.emit("registerNewSensor", { identifier });
  } catch (error) {
    console.error("Exception raised while connecting to Xsens DOT: ", error);
  }
});

xsensManager.on("measurement", (identifier, data) => {
  console.log(`Measurement (${identifier}):`, data);
  io.emit("sensorData", { identifier, data });
});

process.on("SIGINT", async () => {
  console.log("Disconnecting from all devices and exiting...");
  await xsensManager.disconnectAll();
  process.exit();
});

function mockData() {
  const data = {
    timestamp: new Date().getTime(),
    quaternion: {
      w: Math.random(),
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
    },
    freeAcceleration: {
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
    },
  };
  return data;
}

function setupMockData() {
  io.emit("registerNewSensor", { identifier: "mock1" });
  io.emit("registerNewSensor", { identifier: "mock2" });
  io.emit("registerNewSensor", { identifier: "mock3" });
  io.emit("registerNewSensor", { identifier: "mock4" });
  setInterval(() => {
    io.emit("sensorData", { identifier: "mock1", data: mockData() });
    io.emit("sensorData", { identifier: "mock2", data: mockData() });
    io.emit("sensorData", { identifier: "mock3", data: mockData() });
    io.emit("sensorData", { identifier: "mock4", data: mockData() });
  }, 700);
}

io.on("connection", (socket) => {
  setupMockData();
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
