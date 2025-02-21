const socket = io();

/*
 * `sensorData` will contain <sensor id>: object of TimeSeries that are updated with new data via socket.io
 * {
 *  <sensor id>: {
 *  "freeAcceleration": {
 *  "x": TimeSeries,
 *  "y": TimeSeries,
 *  "z": TimeSeries
 *  },
 *  "quaternion": {
 *  "w": TimeSeries
 *  "x": TimeSeries,
 *  "y": TimeSeries,
 *  "z": TimeSeries,
 *  },
 * }
 */
let sensorData = {};

function addCanvas(identifier) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("sensor", identifier);
  canvas.width = 500;
  canvas.height = 400;
  document.getElementById("canvas-container").appendChild(canvas);
  return canvas;
}

function setupSmoothie(identifier) {
  const canvas = addCanvas(identifier);
  const smoothie = new SmoothieChart({
    grid: {
      strokeStyle: "#555555",
      fillStyle: "#000000",
    },
  });

  smoothie.streamTo(canvas, 1000);

  sensorData[identifier] = {
    freeAcceleration: {
      x: new TimeSeries(),
      y: new TimeSeries(),
      z: new TimeSeries(),
    },
    quaternion: {
      w: new TimeSeries(),
      x: new TimeSeries(),
      y: new TimeSeries(),
      z: new TimeSeries(),
    },
  };

  const freeAccelerationX = sensorData[identifier].freeAcceleration.x;
  const freeAccelerationY = sensorData[identifier].freeAcceleration.y;
  const freeAccelerationZ = sensorData[identifier].freeAcceleration.z;
  const quaternionW = sensorData[identifier].quaternion.w;
  const quaternionX = sensorData[identifier].quaternion.x;
  const quaternionY = sensorData[identifier].quaternion.y;
  const quaternionZ = sensorData[identifier].quaternion.z;

  smoothie.addTimeSeries(freeAccelerationX, {
    strokeStyle: "#0062ff",
    lineWidth: 1,
  });
  smoothie.addTimeSeries(freeAccelerationY, {
    strokeStyle: "#e600ff",
    lineWidth: 1,
  });
  smoothie.addTimeSeries(freeAccelerationZ, {
    strokeStyle: "#ff0000",
    lineWidth: 1,
  });
  smoothie.addTimeSeries(quaternionW, { strokeStyle: "#ff9500", lineWidth: 1 });
  smoothie.addTimeSeries(quaternionX, { strokeStyle: "#ffffff", lineWidth: 1 });
  smoothie.addTimeSeries(quaternionY, { strokeStyle: "#4dff00", lineWidth: 1 });
  smoothie.addTimeSeries(quaternionZ, { strokeStyle: "#00c8ff", lineWidth: 1 });

  return smoothie;
}

function updateSensorData(identifier, data) {
  console.log(data);
  console.log(sensorData);
  const freeAcceleration = data.freeAcceleration;
  const quaternion = data.quaternion;

  sensorData[identifier].freeAcceleration.x.append(
    new Date().getTime(),
    freeAcceleration.x,
  );
  sensorData[identifier].freeAcceleration.y.append(
    new Date().getTime(),
    freeAcceleration.y,
  );
  sensorData[identifier].freeAcceleration.z.append(
    new Date().getTime(),
    freeAcceleration.z,
  );
  sensorData[identifier].quaternion.w.append(
    new Date().getTime(),
    quaternion.w,
  );
  sensorData[identifier].quaternion.x.append(
    new Date().getTime(),
    quaternion.x,
  );
  sensorData[identifier].quaternion.y.append(
    new Date().getTime(),
    quaternion.y,
  );
  sensorData[identifier].quaternion.z.append(
    new Date().getTime(),
    quaternion.z,
  );
}

socket.on("registerNewSensor", (data) => {
  setupSmoothie(data.identifier);
});

socket.on("sensorData", (data) => {
  updateSensorData(data.identifier, data.data);
});
