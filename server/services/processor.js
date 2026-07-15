const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Job = require('../models/Job');

// Ensure outputs directory exists
const outputsDir = path.join(__dirname, '../uploads/outputs');
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const updateJobProgress = async (jobId, status, progress, extra = {}) => {
  await Job.findByIdAndUpdate(jobId, { status, progress, ...extra });
};

// PDF processing: extract page count using buffer reading
const processPDF = async (filePath, outputPath) => {
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString('latin1');

  // Count pages by looking for /Page markers
  const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // Fallback: count using /Count pattern
  const countMatch = content.match(/\/Count\s+(\d+)/g);
  let finalCount = pageCount;
  if (countMatch && countMatch.length > 0) {
    const nums = countMatch.map(m => parseInt(m.replace(/\/Count\s+/, '')));
    finalCount = Math.max(...nums);
  }

  const result = {
    originalFile: path.basename(filePath),
    pageCount: finalCount || 1,
    processedAt: new Date().toISOString(),
    fileSize: fs.statSync(filePath).size
  };

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  return outputPath;
};

// Image processing: resize to 800px width
const processImage = async (filePath, outputPath) => {
  await sharp(filePath)
    .resize(800, null, { withoutEnlargement: true })
    .toFile(outputPath);
  return outputPath;
};

// Text processing: count words, lines, characters
const processText = async (filePath, outputPath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const lines = content.split('\n');
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const result = [
    `FileFlow Text Analysis`,
    `=====================`,
    `Original File: ${path.basename(filePath)}`,
    `Processed At:  ${new Date().toISOString()}`,
    ``,
    `Statistics:`,
    `  Characters : ${content.length}`,
    `  Words      : ${words.length}`,
    `  Lines      : ${lines.length}`,
    `  Sentences  : ${sentences.length}`,
    ``,
    `Most Common Words:`,
  ];

  // Top 5 words
  const wordFreq = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 2) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  sorted.forEach(([word, count]) => result.push(`  "${word}" — ${count} times`));

  fs.writeFileSync(outputPath, result.join('\n'));
  return outputPath;
};

const processFile = async (jobId, fileDoc) => {
  try {
    // Step 1: PROCESSING at 0%
    await updateJobProgress(jobId, 'PROCESSING', 0);
    await sleep(800);

    // Step 2: 30%
    await updateJobProgress(jobId, 'PROCESSING', 30);
    await sleep(1000);

    // Step 3: 70% - actual processing
    const ext = path.extname(fileDoc.filePath).toLowerCase();
    const baseName = path.basename(fileDoc.filePath, ext);

    let outputPath;
    let outputExt;

    if (fileDoc.mimeType === 'application/pdf') {
      outputExt = '.json';
    } else if (['image/jpeg', 'image/jpg', 'image/png'].includes(fileDoc.mimeType)) {
      outputExt = ext === '.png' ? '.png' : '.jpg';
    } else {
      outputExt = '.txt';
    }

    outputPath = path.join(outputsDir, `${baseName}_output${outputExt}`);

    await updateJobProgress(jobId, 'PROCESSING', 70);

    if (fileDoc.mimeType === 'application/pdf') {
      await processPDF(fileDoc.filePath, outputPath);
    } else if (['image/jpeg', 'image/jpg', 'image/png'].includes(fileDoc.mimeType)) {
      await processImage(fileDoc.filePath, outputPath);
    } else {
      await processText(fileDoc.filePath, outputPath);
    }

    await sleep(600);

    // Step 4: 100% DONE
    await updateJobProgress(jobId, 'DONE', 100, { outputPath });

  } catch (error) {
    console.error(`Processing error for job ${jobId}:`, error.message);
    await Job.findByIdAndUpdate(jobId, {
      status: 'FAILED',
      progress: 0,
      errorMessage: `Processing failed: ${error.message}`
    });
  }
};

module.exports = { processFile };
