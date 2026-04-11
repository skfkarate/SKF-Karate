const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const logoPath = path.join(__dirname, '../public/logo/SKF logo.png');
  const icon192Path = path.join(__dirname, '../public/icons/icon-192.png');
  const icon512Path = path.join(__dirname, '../public/icons/icon-512.png');

  if (!fs.existsSync(logoPath)) {
    console.error(`Logo not found at: ${logoPath}. Creating stub rectangles instead.`);
    await createStubIcon(192, icon192Path);
    await createStubIcon(512, icon512Path);
    return;
  }

  try {
    console.log('Generating 192x192 icon...');
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 5, g: 8, b: 15, alpha: 1 } // #05080f
      })
      .toFile(icon192Path);

    console.log('Generating 512x512 icon...');
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 5, g: 8, b: 15, alpha: 1 } // #05080f
      })
      .toFile(icon512Path);

    console.log('Icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons with sharp:', err);
  }
}

async function createStubIcon(size, outputPath) {
  try {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 5, g: 8, b: 15, alpha: 1 }
      }
    }).toFile(outputPath);
  } catch (e) {
    console.error('Stub creation failed', e);
  }
}

generateIcons();
