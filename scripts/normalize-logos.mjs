#!/usr/bin/env node
/**
 * Normalize customer logos: trim whitespace, then scale to uniform height.
 * This approach allows natural width variation while ensuring consistent height,
 * which is how professional logo marquees work.
 */
import sharp from 'sharp';
import { readdirSync } from 'fs';
import path from 'path';

const SOURCE_DIR = '/Users/fg/dev/nweb/customer';
const OUTPUT_DIR = '/Users/fg/dev/nweb/src/assets/images/customers';

// Target height for all logos (will display at ~46px via CSS, so 80px gives good retina quality)
const TARGET_HEIGHT = 80;

// Clean filename mapping
const nameMap = {
  'afghanistan-international-bank-logo-png_seeklogo-507957': 'aib',
  'aib': 'aib',
  'agha-khan': 'agha-khan-foundation',
  'chemonics': 'chemonics',
  'creativeassociates': 'creative-associates',
  'da-afghanistan-bank': 'central-bank-afghanistan',
  'doarmy': 'afghan-army',
  'dod': 'department-of-defense',
  'etisalat-logo-png_seeklogo-305437': 'etisalat',
  'giz': 'giz',
  'ifc': 'ifc',
  'siemens': 'siemens',
  'tetra-tech': 'tetratech',
  'un-women': 'un-women',
  'undp': 'undp',
  'unesco': 'unesco',
  'usaid': 'usaid',
  'who': 'who',
  'worldbank': 'world-bank',
};

const files = readdirSync(SOURCE_DIR).filter(f => /\.(png|jpg|jpeg|svg)$/i.test(f));

console.log(`Processing ${files.length} logos → uniform ${TARGET_HEIGHT}px height...\n`);

let success = 0;
let failed = 0;

for (const file of files) {
  const ext = path.extname(file);
  const baseName = file.replace(ext, '');
  const cleanName = nameMap[baseName] || baseName;
  const inputPath = path.join(SOURCE_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, `${cleanName}.png`);

  try {
    // Step 1: Trim whitespace/transparency from the logo
    const trimmed = await sharp(inputPath)
      .trim()                  // Remove surrounding whitespace
      .toBuffer({ resolveWithObject: true });

    const trimmedW = trimmed.info.width;
    const trimmedH = trimmed.info.height;
    
    // Step 2: Scale to target height, maintaining aspect ratio
    const scale = TARGET_HEIGHT / trimmedH;
    const newW = Math.round(trimmedW * scale);
    const newH = TARGET_HEIGHT;

    await sharp(trimmed.data)
      .resize(newW, newH, { fit: 'inside' })
      .png()
      .toFile(outputPath);

    console.log(`✅ ${cleanName}.png: trimmed ${trimmedW}×${trimmedH} → ${newW}×${newH}`);
    success++;
  } catch (e) {
    console.log(`❌ ${cleanName} (${file}): ${e.message}`);
    failed++;
  }
}

console.log(`\n📊 Done: ${success} processed, ${failed} failed`);

// List output + verify uniform heights
console.log('\nOutput files:');
const outputFiles = readdirSync(OUTPUT_DIR).filter(f => /\.png$/i.test(f)).sort();
for (const f of outputFiles) {
  const meta = await sharp(path.join(OUTPUT_DIR, f)).metadata();
  const sizeKB = (await sharp(path.join(OUTPUT_DIR, f)).toBuffer()).length / 1024;
  console.log(`  ${f}: ${meta.width}×${meta.height} (${sizeKB.toFixed(1)}KB)`);
}
