const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'logo.png');
const outDir = 'D:\\Personal\\Temp\\luoda_icons';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function generate() {
  // 读取源图（18158 bytes PNG）
  const img = await sharp(srcPath);
  const metadata = await img.metadata();
  console.log(`Source: ${metadata.width}x${metadata.height}, format=${metadata.format}`);
  
  // Windows ICO (multi-size: 16,32,48,64,128,256)
  // 先生成各尺寸 PNG，再合成 ICO
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = {};
  
  for (const size of sizes) {
    pngBuffers[size] = await sharp(srcPath)
      .resize(size, size)
      .png()
      .toBuffer();
    console.log(`Generated ${size}x${size} PNG: ${pngBuffers[size].length} bytes`);
    
    // 也保存单独的 PNG 文件
    fs.writeFileSync(path.join(outDir, `icon_${size}x${size}.png`), pngBuffers[size]);
  }
  
  // 保存原始 logo 的各种尺寸变体用于各平台
  const platformSizes = [
    { name: 'icon.png', size: null },           // 原始 (res/icon.png)
    { name: 'icon_128x128.png', size: 128 },     // res/128x128.png
    { name: 'icon_256x256.png', size: 256 },     // res/256x256.png
    { name: 'icon_64x64.png', size: 64 },        // res/64x64.png
    { name: 'icon_32x32.png', size: 32 },        // res/32x32.png
    { name: 'mac-icon.png', size: 512 },         // res/mac-icon.png
    { name: 'android_mdpi', size: 48 },          // mipmap-mdpi
    { name: 'android_hdpi', size: 72 },          // mipmap-hdpi
    { name: 'android_xhdpi', size: 96 },         // mipmap-xhdpi
    { name: 'android_xxhdpi', size: 144 },       // mipmap-xxhdpi
    { name: 'android_xxxhdpi', size: 216 },      // mipmap-xxxhdpi
    { name: 'ios_1024', size: 1024 },            // iOS AppIcon 1024
    { name: 'ios_180', size: 180 },              // iOS AppIcon @3x 60pt
    { name: 'ios_120', size: 120 },              // iOS AppIcon @2x 60pt
    { name: 'ios_87', size: 87 },                // iOS AppIcon @3x 29pt
    { name: 'ios_80', size: 80 },                // iOS AppIcon @2x 40pt
    { name: 'ios_60', size: 60 },                // iOS AppIcon @2x 30pt
    { name: 'ios_58', size: 58 },                // iOS AppIcon @2x 29pt
    { name: 'ios_40', size: 40 },                // iOS AppIcon @2x 20pt
    { name: 'ios_29', size: 29 },                // iOS AppIcon 1x 29pt
    { name: 'ios_20', size: 20 },                // iOS AppIcon 1x 20pt
    { name: 'splash_1920', size: 1920 },        // splash screen
    { name: 'scalable.svg', size: null },        // Linux scalable icon
  ];
  
  for (const p of platformSizes) {
    if (!p.size) continue;
    const buf = await sharp(srcPath).resize(p.size, p.size).png().toBuffer();
    fs.writeFileSync(path.join(outDir, p.name), buf);
    console.log(`${p.name}: ${buf.length} bytes`);
  }
  
  // 生成 ICO 文件 (使用 png-to-ico 或手动方式)
  // Node.js 原生方式：用 sharp 生成的多尺寸 PNG
  // 简单方案：直接用最大尺寸作为 ICO (Windows 会自动缩放)
  // 更好的方案：用 ico 库
  try {
    const { toIco } = require('png-to-ico');
    const icoBuf = await toIco([
      path.join(outDir, 'icon_256x256.png'),
      path.join(outDir, 'icon_128x128.png'),
      path.join(outDir, 'icon_64x64.png'),
      path.join(outDir, 'icon_48x48.png'),
      path.join(outDir, 'icon_32x32.png'),
      path.join(outDir, 'icon_16x16.png'),
    ]);
    fs.writeFileSync(path.join(outDir, 'app_icon.ico'), icoBuf);
    console.log(`\nICO file: ${icoBuf.length} bytes`);
  } catch(e) {
    console.log('\npng-to-ico not available, using fallback...');
    // fallback: 直接用 256x256 作为单尺寸 ICO
    const icoBuf = await sharp(path.join(outDir, 'icon_256x256.png')).ico().toBuffer();
    fs.writeFileSync(path.join(outDir, 'app_icon.ico'), icoBuf);
    console.log(`ICO (fallback): ${icoBuf.length} bytes`);
  }
  
  console.log('\nAll icons generated in:', outDir);
}

generate().catch(console.error);
