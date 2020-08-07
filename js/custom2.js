var sound = new Audio('sound/barcode.wav');

/**
 * Ejecuta el sonido cuando el codigo de barras ha sido escaneado
 */
function playSound() {
    sound.play();
}

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

window.addEventListener('load', function () {
    let selectedDeviceId;
    const codeReader = new ZXing.BrowserMultiFormatReader();
    console.log('ZXing code reader initialized')
    codeReader.listVideoInputDevices()
      .then((videoInputDevices) => {
        const sourceSelect = document.getElementById('sourceSelect')
        selectedDeviceId = videoInputDevices[0].deviceId
        console.log("selectedDeviceId", videoInputDevices);
        
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
                console.log(trackStream);
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
          console.log('Reset.')
        })

      })
      .catch((err) => {
        console.error(err)
      })
});