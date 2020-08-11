var sound = new Audio('sound/barcode.wav');



var streaming;
var trackStream;
var _torch = false;

function linterna() {
  console.log('inicie la linterna...')
  _torch = !_torch;
  if(isSoported && trackStream){
    trackStream.applyConstraints({
        advanced: [{torch: _torch}]
    })
  }
}

/**
 * Ejecuta el sonido cuando el codigo de barras ha sido escaneado
 */
function playSound() {
  sound.play();
}

function openPopup() {
  document.getElementById("cam-fullscreen").style.width = "100%";
  iniciar();
}
function closePopup() {
  document.getElementById("cam-fullscreen").style.width = "0%";
  document.getElementById('sourceSelect').innerHTML = '';
}

function isSoported() {
  let supported = navigator.mediaDevices.getSupportedConstraints();
  return supported;
}

function disabledBtn() {
  document.getElementById('torchButton').hidden = true;
  document.getElementById('zooOutButton').hidden = true;
  document.getElementById('zooInButton').hidden = true;
}

function enabledBtn() {
  document.getElementById('torchButton').hidden = false;
  document.getElementById('zooOutButton').hidden = false;
  document.getElementById('zooInButton').hidden = false;
}

document.getElementById('btn-scannear').addEventListener('click', openPopup);


function iniciar() {    
  disabledBtn()
  let selectedDeviceId;
  const codeReader = new ZXing.BrowserMultiFormatReader();
  console.log('ZXing code reader initialized')
  codeReader.listVideoInputDevices()
    .then((videoInputDevices) => {
      const sourceSelect = document.getElementById('sourceSelect')
      selectedDeviceId = videoInputDevices[0].deviceId
      
      if (videoInputDevices.length >= 1) {
        videoInputDevices.forEach((element) => {
          const sourceOption = document.createElement('option')
          sourceOption.text = element.label
          sourceOption.value = element.deviceId
          sourceSelect.appendChild(sourceOption)
        })
        sourceSelect.onchange = () => {
          selectedDeviceId = sourceSelect.value;
        };

        const sourceSelectPanel = document.getElementById('sourceSelectPanel')
        sourceSelectPanel.style.display = 'block'          
      }

      document.getElementById('startButton').addEventListener('click', () => {
        console.log('start media...')
        navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId
          }
        }).then(stream => {
          streaming = stream;
          trackStream = stream.getVideoTracks()[0];
          let capabilities = trackStream.getCapabilities();
          if(capabilities.zoom && capabilities.torch){
            enabledBtn();
          } else {
            disabledBtn();
          }
          const zooInBtn = document.querySelector('#zooInButton');
          const torchBtn = document.querySelector('#torchButton');
          torchBtn.addEventListener('click', () => {
              console.log('linterna...')
              linterna();
          });
          zooInBtn.addEventListener('click', () => {
            console.log('zooInBtn');
            let capabilities = trackStream.getCapabilities();
            console.log(capabilities);
            
            trackStream.applyConstraints(
              [{zoom: capabilities.zoom.max}]
            );

          });
        });

        codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
          if (result) {
            console.log(result);
            playSound();
            document.getElementById('result').value = result.text
            codeReader.reset();
            if(trackStream) trackStream.stop();
            closePopup();
          }
          if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err)
          }
        })
        console.log(`Started continous decode from camera with id ${selectedDeviceId}`)
      })

      document.getElementById('resetButton').addEventListener('click', () => {
        console.log('reset...')
        codeReader.reset();
        if(trackStream) trackStream.stop();
        document.getElementById('result').value = '';
      });

      document.getElementById('btn-close').addEventListener('click', () => {
        console.log('cerrar popup...')
        closePopup();
        codeReader.reset();
        if(trackStream) trackStream.stop();
      });

    })
    .catch((err) => {
      console.error(err)
    })
}