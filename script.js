const imageInput = document.getElementById('imageInput');
const status = document.getElementById('status');
const show = document.getElementById('show')
const selectbutton = document.getElementById('select')
const convertbutton = document.getElementById('convertbutton')
convertbutton.disabled = true
const files = []

async function select() {
    files.push(...imageInput.files);
    if (!imageInput.files.length) {
        status.textContent = "Please select at least one image!";
        status.style.color = "red";
        return;
    };
    console.log("yasah")
    convertbutton.disabled = false
    show.innerHTML = ""
    for (let i = 0; i < files.length; i++) {
        const imgDataUrl = await readFileAsDataURL(files[i]);
        const img = document.createElement("img")
        img.src = imgDataUrl
        img.style.width = '150px'
        img.id = `img${i}`
        show.appendChild(img)
        await getImageDimensions(imgDataUrl);
        // show.innerHTML+=<button id="cut">cut</button>
        // show.innerHTML+=<button id="rotate">rotate</button>

        // const cutButton = document.createElement("button");
        // cutButton.classList.add("cut-btn");
        // cutButton.innerHTML = "✂";
        // cutButton.onclick = () => removeImage(container, i);
    };
    selectbutton.disabled = true
    imageInput.value = ""
};

// function removeImage(container, index) {
//     container.remove();
//     files.splice(index, 1);
//     if (!files.length) convertButton.disabled = true;
// }









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

        // Calculate aspect ratio and dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth(); // Fixed PDF width
        const pdfHeight = ((imgDimensions.height * pdfWidth) / imgDimensions.width).toFixed(2); // Adjust height to aspect ratio

        // Set the page size to match the image
        pdf.setPage(i + 1); // Ensure you're on the correct page
        pdf.internal.pageSize.setHeight(parseFloat(pdfHeight)); // Adjust the page height dynamically

        // Add the image to the page
        pdf.addImage(imgDataUrl, 'WEBP', 0, 0, pdfWidth, parseFloat(pdfHeight), undefined, "SLOW");

        // Add a new page if it's not the last image
        if (i < files.length - 1) {
            pdf.addPage(); // Add a new page
        }
    }

    pdf.save('multiple-images.pdf');
    status.textContent = "PDF has been created successfully!";
    status.style.color = "green";

    // Disable the convert button after successful generation
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
async function click() {

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

// async function select() {
//     files.push(...imageInput.files);
//     if (!imageInput.files.length) {
//         status.textContent = "Please select at least one image!";
//         status.style.color = "red";
//         return;
//     }
//     convertButton.disabled = false;
//     show.innerHTML = "";
//     for (let i = 0; i < files.length; i++) {
//         const imgDataUrl = await readFileAsDataURL(files[i]);
//         const container = document.createElement("div");
//         container.classList.add("image-container");

//         const img = document.createElement("img");
//         img.src = imgDataUrl;
//         img.style.width = '150px';
//         img.id = `img${i}`;

//         const rotateButton = document.createElement("button");
//         rotateButton.classList.add("rotate-btn");
//         rotateButton.innerHTML = "⟳";
//         rotateButton.onclick = () => rotateImage(container);

//         const cutButton = document.createElement("button");
//         cutButton.classList.add("cut-btn");
//         cutButton.innerHTML = "✂";
//         cutButton.onclick = () => removeImage(container, i);

//         container.appendChild(img);
//         container.appendChild(rotateButton);
//         container.appendChild(cutButton);
//         show.appendChild(container);
//     }
//     selectButton.disabled = true;
//     imageInput.value = "";
// }