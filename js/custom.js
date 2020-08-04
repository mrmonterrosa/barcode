var _scannerIsRunning = false;
var _scannerIsDetect = false;

var sound = new Audio('sound/barcode.wav');

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#cam'),
            constraints: {
                width: 460,
                facingMode: 'environment',
                aspectRatio: {
                  min: 1,
                  max: 2,
                },
            },  
        },
        decoder: {
            readers: ["code_128_reader"]
        },
        locate: false,
        halfSample: true,
        patchSize: "medium",

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });
    /**
     * Mientras la imagen/video es procesada se crea un canvas señalando
     * los posible lugares donde se pueda 
     */
    
    Quagga.onProcessed(function (result) {

        let drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, 
                    parseInt(drawingCanvas.getAttribute('width')), 
                    parseInt(drawingCanvas.getAttribute('height')));
                result.boxes.filter(function (box) {
                return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1,
                    }, drawingCtx, {
                        color: 'green',
                        lineWidth: 2,
                    });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1,
                }, drawingCtx, {
                    color: '#00F',
                    lineWidth: 2,
                });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y',
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }

        }

    });
    // Evento que esta a la escucha cuando el codigo de barras es detectado
    Quagga.onDetected(function (result) {
        _scannerIsDetect = true;
        playSound();
        $('#input-scan').val(result.codeResult.code);
        stopHidenScan();
    });

    
}
/**
 * Ejecuta el sonido cuando el codigo de barras ha sido escaneado
 */
function playSound() {
    sound.play();
}
/**
 * Oculta el modal, detiene la camara y 
 * coloca la bandera del scanner como false 
 * (Scanner detenido/ camara no esta corriendo)
 */
function stopHidenScan() {    
    $('#scan-modal').modal('hide')
    Quagga.stop();
    _scannerIsRunning = false;
}
/**
 * Evento del boton scan que levanta el modal del scaner 
 * si este no esta corriendo
 */
document.getElementById("btn-scan").addEventListener("click", function () {
    if (!_scannerIsRunning) {
        startScanner();
    }
}, false);
/**
 * Evento del boton cancelar que detiene y cierra el modal del scanner 
 * si este está corriendo
 */
document.getElementById("btn-cancelar").addEventListener("click", function () {
    if (_scannerIsRunning) {
        stopHidenScan();
    }
}, false);
/**
 * Evento del boton (X) que detiene y cierra el modal del scanner 
 * si este está corriendo
 */
document.getElementById("btn-cancelar-small").addEventListener("click", function () {
    if (_scannerIsRunning) {
        stopHidenScan();
    }
}, false);
