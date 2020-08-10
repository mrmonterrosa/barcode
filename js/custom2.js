var sound = new Audio('sound/barcode.wav');



var streaming;
var trackStream;
var _torch = false;

function linterna() {
    console.log(_torch);
    _torch = !_torch;
    trackStream.applyConstraints({
        advanced: [{torch: _torch}]
    })
}

/**
 * Ejecuta el sonido cuando el codigo de barras ha sido escaneado
 */
function playSound() {
  sound.play();
}

function openPopup() {
  document.getElementById("cam-fullscreen").style.width = "100%";
  inciar ();
}

document.getElementById('btn-scannear').addEventListener('click', openPopup);


function inciar () {
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
            document.getElementById('startButton').click();
          };

          const sourceSelectPanel = document.getElementById('sourceSelectPanel')
          sourceSelectPanel.style.display = 'block'          
        }

        document.getElementById('startButton').addEventListener('click', () => {

            navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: selectedDeviceId
                }
            }).then(stream => {
                streaming = stream;
                trackStream = stream.getVideoTracks()[0];
                const torchBtn = document.querySelector('#torchButton');
                torchBtn.addEventListener('click', () => {
                    linterna();
                });
            });

            codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
                if (result) {
                    console.log(result);
                    playSound();
                    document.getElementById('result').value = result.text
                    linterna();
                    codeReader.reset();
                    trackStream.stop();
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err)
                }
            })
          console.log(`Started continous decode from camera with id ${selectedDeviceId}`)
        })

        document.getElementById('startButton').click();

        document.getElementById('resetButton').addEventListener('click', () => {
          codeReader.reset();
          trackStream.stop();
          document.getElementById('result').value = '';
        });

        document.getElementById('btn-close').addEventListener('click', () => {
          document.getElementById("cam-fullscreen").style.width = "0%";
          document.getElementById('sourceSelect').innerHTML = '';
          codeReader.reset();
        });

      })
      .catch((err) => {
        console.error(err)
      })
}