const express = require('express');
const path = require('path');
const { createCanvas } = require('canvas');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Home route serves the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Decode form data from base64 URL component
// Decode form data from base64 URL component
function decodeFormData(encodedData) {
  console.log('Received encoded data:', encodedData); // Log incoming data
  if (!encodedData) {
      console.error("No encoded data received");
      return null;
  }

  const parts = encodedData.split('-');
  if (parts.length < 2) {
      console.error("Encoded data is invalid. It should contain two parts separated by '-', received:", encodedData);
      return null;
  }

  const bitmaskStr = parts[0];
  const encodedMessage = parts[1] || '';

  try {
      const bitmask = parseInt(bitmaskStr, 36);
      const message = Buffer.from(encodedMessage, 'base64').toString('ascii');
      const choices = [];
      const labels = ['whatthe', 'idga', 'me', 'yes', 'off', 'and die', 'that', 'it', 'you', 'and the horse you rode in on', 'this', 'the man', 'other'];

      labels.forEach((label, index) => {
          choices.push({
              label: label,
              checked: (bitmask & (1 << index)) !== 0
          });
      });

      console.log('Decoded form data:', { choices, message }); // Log decoded data
      return { choices, message };
  } catch (error) {
      console.error("Error decoding form data:", error);
      return null;
  }
}

// Generate an image from form data using canvas
function createCardImage(formData) {
  if (!formData || formData.whatthe === undefined) {
    console.error('Invalid form data received:', formData);
    return; // Optionally handle error more gracefully
  }
  const width = 800;  // Canvas width to fit the complex layout
  const height = 600; // Sufficient height to accommodate all elements
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background and basic styling
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';

  // Initial checkboxes above the title
  ctx.fillText(`WHAT THE: ${formData['whatthe'] ? 'YES' : 'NO'}`, 50, 30);
  ctx.fillText(`I DON'T GIVE A: ${formData['idga'] ? 'YES' : 'NO'}`, 250, 30);

  // Title
  ctx.font = '30px Arial';
  ctx.fillText("FUCK", width / 2 - ctx.measureText("FUCK").width / 2, 70); // Centered
  ctx.font = '16px Arial'; // Reset font size for other texts

  // Column coordinates and initial Y positions
  const columns = [
      { x: 50, y: 100 },   // Column 1
      { x: 280, y: 100 },  // Column 2
      { x: 510, y: 100 }   // Column 3
  ];

  // Layout adjustments and render checkboxes and labels
  const lineHeight = 30;
  formData.choices.forEach((choice, index) => {
      const column = columns[index % 3];

      // Adjustments for specific layout requirements
      if (choice.label === 'and die' || choice.label === 'it') {
          column.x += 20; // Indent for specific items
      } else if (choice.label === 'and the horse you rode in on') {
          column.x -= 20; // Span back for this item
          column.y = columns[1].y + lineHeight; // Align with the second column
      }

      // Draw the checkbox and label
      ctx.fillText(`${choice.label.toUpperCase()}: ${choice.checked ? 'YES' : 'NO'}`, column.x, column.y);
      column.y += lineHeight; // Move down in the current column

      // Reset x position if modified for indentation
      if (choice.label === 'and die' || choice.label === 'it' || choice.label === 'and the horse you rode in on') {
          column.x = columns[index % 3].x;
      }
  });

  // Custom message below all items
  const messageY = Math.max(...columns.map(col => col.y)) + 20; // Position below the last item in the tallest column
  ctx.fillText(`Custom message: ${formData.message || 'No message'}`, 50, messageY);

  return canvas.toBuffer();
}

// Ensure dynamic image generation handles errors
app.get('/cards/:data', (req, res) => {
  const formData = decodeFormData(req.params.data);
  if (!formData) {
      res.status(400).send("Failed to decode data. Please ensure the data is correctly formatted.");
      return;
  }
  const imageBuffer = createCardImage(formData);
  res.set('Content-Type', 'image/png');
  res.send(imageBuffer);
});

// Middleware to inject Open Graph tags dynamically
app.use((req, res, next) => {
  if (req.path.startsWith('/cards/')) {
    // Assuming you serve an HTML file that needs custom OG tags
    const formData = decodeFormData(req.params.data);
    const dynamicHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, 
initial-scale=1.0">
        <meta property="og:title" content="Custom Card" />
        <meta property="og:description" content="Check out my 
custom card!" />
        <meta property="og:image" 
content="${req.protocol}://${req.get('host')}${req.originalUrl}" 
/>
        <title>Custom Card</title>
      </head>
      <body>
        <p>Card generated based on user input. Check out the 
image via the og:image tag.</p>
      </body>
      </html>
    `;
    res.send(dynamicHtmlContent);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

