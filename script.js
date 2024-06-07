// referencing all the buttons and tools 
const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    undoBtn = document.getElementById('undo'),
    redoBtn = document.getElementById('redo'),
    ctx = canvas.getContext("2d");

    // intial values of variables 
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000",
    history = [],
    redoHistory = [],
    currentStep = -1;

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

window.addEventListener("load", () => {

    // setting the canvas widht and height
    canvas.width = window.innerWidth - 30;
    canvas.height = window.innerHeight - 25;
           

    // below code is so that the resolution of the canvas is maintained when scaling src:https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

        // Get the DPR and size of the canvas
    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;


    setCanvasBackground();
   
});

// Save canvas state to history
const saveState = () => {
    if (currentStep < history.length - 1) {
        history = history.slice(0, currentStep + 1);
        redoHistory = [];
    }
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    currentStep++;
}

// Undo function
const undo = () => {
    if (currentStep > 0) {
        redoHistory.push(history[currentStep]);
        currentStep--;
        ctx.putImageData(history[currentStep], 0, 0);
    }
}

// Redo function
const redo = () => {
    if (redoHistory.length > 0) {
        currentStep++;
        let imageData = redoHistory.pop();
        ctx.putImageData(imageData, 0, 0);
        history.push(imageData);
    }
}


// shapes
// rectangle
const drawRect = (e) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, prevMouseX - e.clientX, prevMouseY - e.clientY);
    }
    ctx.fillRect(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, prevMouseX - e.clientX, prevMouseY - e.clientY);
}

// line
const drawLine = (e) => {   
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
}

// circle
const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.clientX), 2) + Math.pow((prevMouseY - e.clientY), 2));
    ctx.arc(prevMouseX - canvas.offsetLeft, prevMouseY - canvas.offsetTop, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// triangle
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX - canvas.offsetLeft, prevMouseY - canvas.offsetTop);
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.lineTo(prevMouseX * 2 - e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// function to start draw (when mouse is down)
const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.clientX - canvas.offsetLeft;
    prevMouseY = e.clientY - canvas.offsetTop;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    saveState();
}

// drawing function for mouse move
const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if  (selectedTool === "line") {
        drawLine(e);
    } else {
        drawTriangle(e);
    }
}

// for getting the tool selected
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        console.log(toolBtns , 'abc')
        selectedTool = btn.id;
        console.log(selectedTool , 'xys')
    });
});

// to change color
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
    selectedColor = colorPicker.value;
});

// code to clear canvas
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.clear();
    setCanvasBackground();
    history = [];
    redoHistory = [];
    currentStep = -1;
});

// save image 
saveImg.addEventListener("click", () => {
    const link = document.createElement("a"); 
    link.download = `canvasImg.jpg`; 
    link.href = canvas.toDataURL(); 
    link.click(); 
});





// event handler for undo , redo
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);


// mouse down -> mouse move -> mouse up
// event handler
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);
