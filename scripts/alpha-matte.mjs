#!/usr/bin/env node
/**
 * Alpha Matting via Difference Method
 * 
 * Given two images of the same subject:
 *   - one on a pure WHITE (#FFFFFF) background
 *   - one on a pure BLACK (#000000) background
 * 
 * Math:
 *   white_pixel = alpha * fg + (1 - alpha) * 255
 *   black_pixel = alpha * fg + (1 - alpha) * 0 = alpha * fg
 * 
 *   white - black = (1 - alpha) * 255
 *   alpha = 1 - (white - black) / 255
 *   fg = black / alpha  (when alpha > 0)
 * 
 * Usage:
 *   node alpha-matte.mjs <white.png> <black.png> <output.png>
 */

import sharp from 'sharp';

const [,, whitePath, blackPath, outputPath] = process.argv;

if (!whitePath || !blackPath || !outputPath) {
  console.error('Usage: node alpha-matte.mjs <white.png> <black.png> <output.png>');
  process.exit(1);
}

// Load both images as raw RGBA
const whiteImg = sharp(whitePath).ensureAlpha();
const blackImg = sharp(blackPath).ensureAlpha();

const whiteMeta = await whiteImg.metadata();
const blackMeta = await blackImg.metadata();

// Ensure same dimensions
const width = whiteMeta.width;
const height = whiteMeta.height;

if (width !== blackMeta.width || height !== blackMeta.height) {
  console.error(`Dimension mismatch: white=${width}x${height} black=${blackMeta.width}x${blackMeta.height}`);
  // Resize black to match white
  console.log('Resizing black image to match white...');
}

const whiteRaw = await whiteImg.resize(width, height).raw().toBuffer();
const blackRaw = await blackImg.resize(width, height).raw().toBuffer();

// Both buffers are RGBA, 4 bytes per pixel
const numPixels = width * height;
const output = Buffer.alloc(numPixels * 4);

for (let i = 0; i < numPixels; i++) {
  const off = i * 4;
  
  // Get RGB from both images
  const wR = whiteRaw[off];
  const wG = whiteRaw[off + 1];
  const wB = whiteRaw[off + 2];
  
  const bR = blackRaw[off];
  const bG = blackRaw[off + 1];
  const bB = blackRaw[off + 2];
  
  // Calculate alpha per channel and average
  // alpha = 1 - (white - black) / 255
  const aR = 1 - (wR - bR) / 255;
  const aG = 1 - (wG - bG) / 255;
  const aB = 1 - (wB - bB) / 255;
  
  // Average the alpha estimates
  const alpha = Math.max(0, Math.min(1, (aR + aG + aB) / 3));
  
  // Quantize alpha to 0-255
  const alphaInt = Math.round(alpha * 255);
  
  if (alphaInt === 0) {
    // Fully transparent
    output[off] = 0;
    output[off + 1] = 0;
    output[off + 2] = 0;
    output[off + 3] = 0;
  } else {
    // Recover foreground color: fg = black_pixel / alpha
    const fgR = Math.min(255, Math.round(bR / alpha));
    const fgG = Math.min(255, Math.round(bG / alpha));
    const fgB = Math.min(255, Math.round(bB / alpha));
    
    output[off] = fgR;
    output[off + 1] = fgG;
    output[off + 2] = fgB;
    output[off + 3] = alphaInt;
  }
}

await sharp(output, {
  raw: {
    width,
    height,
    channels: 4,
  },
})
  .png()
  .toFile(outputPath);

console.log(`✅ Wrote ${outputPath} (${width}x${height}, true alpha)`);
