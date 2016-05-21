"use strict";

const input = navigator.mediaDevices.getUserMedia({ audio: true, video: false});
const record = document.querySelector('#record');
const stop = document.querySelector('#stop');
const canvas = document.querySelector('#visualizer');
const audioCtx = new window.AudioContext();

function upload(blob) {
  console.log("start uploading");
  console.log(`blob: ${blob}`);
  const req = new XMLHttpRequest();
  req.open("POST", "http://localhost:8666", true);
  req.onload= e => console.log("uploaded!");
  req.onerror = e => console.log(`DOOM ${e}`);
  req.send(blob);
}

function talkToMe(stream) {
  const mediaRecorder = new MediaRecorder(stream);
  let chunks = [];

  visualize(stream, audioCtx, canvas);

  record.onclick = () => {
    mediaRecorder.start();
    console.log(mediaRecorder.state);
    console.log("recorder started");

  };

  stop.onclick = () => {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
  };

  mediaRecorder.onstop = (e) => {
    const blob = new Blob(chunks, { type : "audio/ogg; codecs=opus" });
    console.log(`size ${blob.size}`);
    upload(blob);
    chunks = [];
    console.log("recorder stopped");
  };


  mediaRecorder.ondataavailable = e => chunks.push(e.data);

}

function visualize(stream, audioCtx, canvas) {
  const source = audioCtx.createMediaStreamSource(stream);
  const canvasCtx = canvas.getContext("2d");

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  draw();

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    const sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
  }
}

input.then(talkToMe);
