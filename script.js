// Define DOM elements
const imageInput = document.getElementById('imageInput');
const status = document.getElementById('status');
const show = document.getElementById('show');
const selectbutton = document.getElementById('select');
const convertbutton = document.getElementById('convertbutton');
convertbutton.disabled = true;
const files = [];
const imageRotation = new Map();

// Select images
async function select() {
    files.push(...imageInput.files);
    if (!imageInput.files.length) {
        status.textContent = "Please select at least one image!";
        status.style.color = "red";
        return;
    }
    convertbutton.disabled = false;
    show.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
        await renderImage(files[i], i);
    }
    selectbutton.disabled = true;
    imageInput.value = "";
}

// Render image
async function renderImage(file, index) {
    const imgDataUrl = await readFileAsDataURL(file);
    const div1 = document.createElement("div");
    div1.classList.add("grid");
    show.appendChild(div1);

    const img = document.createElement("img");
    img.src = imgDataUrl;
    
    // Create a separate Image instance to load the image and get its dimensions
    const imgprocess = new Image();
    imgprocess.src = imgDataUrl;
    
    imgprocess.onload = () => {
        const [width, height] = [imgprocess.width, imgprocess.height];
        console.log("Image dimensions:", width, height);
    
        if (width <= height) {
            img.style.width = '150px';
        } else {
            img.style.width = '250px';
        }
    };
    
    img.id = `img${index}`;
    img.className = "image";
    
    // Append the image to the DOM
    div1.appendChild(img);
    

    const cutButton = document.createElement("button");
    cutButton.classList.add("cutbutton");
    cutButton.innerHTML = "✂";
    cutButton.onclick = () => removeImage(index);
    div1.appendChild(cutButton);

    const rotateButton = document.createElement("button");
    rotateButton.classList.add("rotateButton");
    rotateButton.innerHTML = "⟳";
    rotateButton.onclick = () => rotateImage(index);
    div1.appendChild(rotateButton);
}

// Remove image
async function removeImage(index) {
    files.splice(index, 1);
    show.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
        await renderImage(files[i], i);
    }
    convertbutton.disabled = files.length === 0;
}

// Rotate image
async function rotateImage(index) {
    const imgElement = document.getElementById(`img${index}`);
    const currentRotation = (imageRotation.get(index) || 0) + 90;
    imageRotation.set(index, currentRotation % 360);
    imgElement.style.transform = `rotate(${currentRotation % 360}deg)`;
    const imgDataUrl = await readFileAsDataURL(files[index]);
    const rotatedDataUrl = await rotateImageData(imgDataUrl, currentRotation % 360);
    const updatedFile = await dataURLToFile(rotatedDataUrl, files[index].name);
    files[index] = updatedFile;
}

function dataURLToFile(dataUrl, filename) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// Rotate image data
async function rotateImageData(dataUrl, angle) {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            const [width, height] = [img.width, img.height];
            if (angle % 180 !== 0) {
                [canvas.width, canvas.height] = [height, width];
            } else {
                [canvas.width, canvas.height] = [width, height];
            }

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.drawImage(img, -width / 2, -height / 2);
            resolve(canvas.toDataURL());
        };

        img.src = dataUrl;
    });
}
async function convertToPDF() {

    console.log(imageInput.files);

    if (!files.length) {
        status.textContent = "Please select at least one image!";
        status.style.color = "red";
        return;
    }

    status.textContent = "Processing...";
    status.style.color = "black";

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
    });

    for (let i = 0; i < files.length; i++) {
        console.log(`${i} - Processing file`);
        const imgDataUrl = await readFileAsDataURL(files[i]);
        const imgDimensions = await getImageDimensions(imgDataUrl);

        console.log(imgDimensions.width, imgDimensions.height);
        const pdfWidth = pdf.internal.pageSize.getWidth(); // Fixed PDF width
        const pdfHeight = ((imgDimensions.height * pdfWidth) / imgDimensions.width).toFixed(2); // Adjust height to aspect ratio
        pdf.setPage(i + 1); // Ensure you're on the correct page
        pdf.internal.pageSize.setHeight(parseFloat(pdfHeight));
        pdf.addImage(imgDataUrl, 'WEBP', 0, 0, pdfWidth, parseFloat(pdfHeight), undefined, "SLOW");
        if (i < files.length - 1) {
            pdf.addPage();
        }
    }

    pdf.save('multiple-images.pdf');
    status.textContent = "PDF has been created successfully!";
    status.style.color = "green";
    convertbutton.disabled = true;

}

// Utility function to read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Utility function to get image dimensions
function getImageDimensions(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = dataUrl;


    });
}

async function addpage() {
    selectbutton.disabled = false
}
async function reset() {
    convertbutton.disabled = true
    selectbutton.disabled = false
    show.innerHTML = ""
    files.length = 0;

}