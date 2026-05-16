const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'logo.png');
const outDir = 'D:\\Personal\\Temp\\luoda_icons';

// 手动构建 ICO 文件 (PNG-in-ICO format)
async function createIco() {
  const sizes = [256, 128, 64, 48, 32, 16];
  
  // ICO header: reserved(2) + type(2)=1 + count(2)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);   // reserved
  header.writeUInt16LE(1, 2);   // type: icon
  header.writeUInt16LE(sizes.length, 4); // count
  
  let offset = 6 + sizes.length * 16; // header + directory entries
  const entries = [];
  const pngBuffers = [];
  
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const pngBuf = await sharp(srcPath).resize(size, size).png().toBuffer();
    pngBuffers.push(pngBuf);
    
    // Directory entry: width(1) height(1) colors(1) reserved(1) planes(2) bpp(2) size(4) offset(4)
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);  // width (0 means 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // height
    entry.writeUInt8(0, 2);     // color count
    entry.writeUInt8(0, 3);     // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngBuf.length, 8); // data size
    entry.writeUInt32LE(offset, 12);       // data offset
    entries.push(entry);
    
    offset += pngBuf.length;
  }
  
  const ico = Buffer.concat([header, ...entries, ...pngBuffers]);
  fs.writeFileSync(path.join(outDir, 'app_icon.ico'), ico);
  console.log(`ICO file created: ${ico.length} bytes`);
}

createIco().catch(console.error);
