import fs from 'fs';
import sharp from 'sharp';

// 1. App Icon SVG (512x512) - High contrast, centered emblem matching user's uploaded logo
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#141838" />
      <stop offset="60%" stop-color="#0b0e24" />
      <stop offset="100%" stop-color="#060814" />
    </radialGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff3344" />
      <stop offset="100%" stop-color="#cc1122" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <clipPath id="micCapsule">
      <rect x="206" y="150" width="100" height="110" rx="40" ry="40" />
    </clipPath>
  </defs>

  <!-- Dark Rich Navy Background -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)" />

  <!-- SOUNDWAVES LEFT (Red concentric arcs) -->
  <g fill="none" stroke="#e61e2b" stroke-linecap="round" opacity="0.95">
    <path d="M 186 160 A 68 68 0 0 0 186 250" stroke-width="14" />
    <path d="M 160 135 A 105 105 0 0 0 160 275" stroke-width="15" />
    <path d="M 132 110 A 145 145 0 0 0 132 300" stroke-width="16" />
  </g>

  <!-- SOUNDWAVES RIGHT (Red concentric arcs) -->
  <g fill="none" stroke="#e61e2b" stroke-linecap="round" opacity="0.95">
    <path d="M 326 160 A 68 68 0 0 1 326 250" stroke-width="14" />
    <path d="M 352 135 A 105 105 0 0 1 352 275" stroke-width="15" />
    <path d="M 380 110 A 145 145 0 0 1 380 300" stroke-width="16" />
  </g>

  <!-- HEADPHONE / HALO CIRCULAR ARCH TOP (Red ring) -->
  <path d="M 216 195 A 46 46 0 1 1 296 195" fill="none" stroke="#e61e2b" stroke-width="15" stroke-linecap="round" />

  <!-- WHITE STAR INSIDE CIRCULAR ARCH -->
  <polygon points="256,112 265,134 288,135 270,149 277,171 256,157 235,171 242,149 224,135 247,134" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />

  <!-- MICROPHONE CAPSULE (Indonesian Flag: Merah Putih) -->
  <rect x="204" y="158" width="104" height="106" rx="42" ry="42" fill="none" stroke="#e61e2b" stroke-width="4" />
  
  <g clip-path="url(#micCapsule)">
    <rect x="200" y="145" width="112" height="60" fill="url(#redGrad)" />
    <rect x="200" y="205" width="112" height="65" fill="#ffffff" />
    <line x1="200" y1="205" x2="312" y2="205" stroke="#c00" stroke-width="1.5" />
  </g>

  <!-- CRADLE & STAND (Split Red/White Motif from logo) -->
  <path d="M 194 185 C 194 265 256 282 256 282" fill="none" stroke="#e61e2b" stroke-width="13" stroke-linecap="round" />
  <path d="M 318 185 C 318 265 256 282 256 282" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round" />

  <!-- Vertical Stem -->
  <line x1="251" y1="282" x2="251" y2="312" stroke="#e61e2b" stroke-width="10" />
  <line x1="261" y1="282" x2="261" y2="312" stroke="#ffffff" stroke-width="10" />

  <!-- Base mount -->
  <rect x="228" y="308" width="28" height="12" rx="3" fill="#e61e2b" />
  <rect x="256" y="308" width="28" height="12" rx="3" fill="#ffffff" />

  <!-- BRAND TYPOGRAPHY: RADIO HIT INDONESIA -->
  <text x="256" y="358" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-style="italic" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="3">RADIO HIT</text>
  <text x="256" y="392" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-style="italic" font-size="29" fill="#ffffff" text-anchor="middle" letter-spacing="4">INDONESIA</text>

  <!-- EQUALIZER BARS BELOW -->
  <rect x="190" y="432" width="20" height="7" rx="1.5" fill="#e61e2b" />
  <rect x="190" y="420" width="20" height="7" rx="1.5" fill="#e61e2b" />
  <rect x="190" y="408" width="20" height="7" rx="1.5" fill="#e61e2b" />

  <rect x="217" y="432" width="20" height="7" rx="1.5" fill="#ff6075" />
  <rect x="217" y="420" width="20" height="7" rx="1.5" fill="#ff6075" />

  <rect x="244" y="432" width="20" height="7" rx="1.5" fill="#cfdbff" />
  <rect x="244" y="420" width="20" height="7" rx="1.5" fill="#cfdbff" />
  <rect x="244" y="408" width="20" height="7" rx="1.5" fill="#cfdbff" />

  <rect x="271" y="432" width="20" height="7" rx="1.5" fill="#ffffff" />
  <rect x="271" y="420" width="20" height="7" rx="1.5" fill="#ffffff" />

  <rect x="298" y="432" width="20" height="7" rx="1.5" fill="#ffffff" />
  <rect x="298" y="420" width="20" height="7" rx="1.5" fill="#ffffff" />
  <rect x="298" y="408" width="20" height="7" rx="1.5" fill="#ffffff" />
</svg>`;

// 2. Maskable Icon SVG (512x512)
const maskableIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGradMask" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#141838" />
      <stop offset="60%" stop-color="#0b0e24" />
      <stop offset="100%" stop-color="#060814" />
    </radialGradient>
    <linearGradient id="redGradMask" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff3344" />
      <stop offset="100%" stop-color="#cc1122" />
    </linearGradient>
    <clipPath id="micCapsuleMask">
      <rect x="216" y="165" width="80" height="90" rx="34" ry="34" />
    </clipPath>
  </defs>

  <!-- Full-bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <g transform="translate(51, 51) scale(0.8)">
    <!-- SOUNDWAVES LEFT -->
    <g fill="none" stroke="#e61e2b" stroke-linecap="round" opacity="0.95">
      <path d="M 186 160 A 68 68 0 0 0 186 250" stroke-width="14" />
      <path d="M 160 135 A 105 105 0 0 0 160 275" stroke-width="15" />
      <path d="M 132 110 A 145 145 0 0 0 132 300" stroke-width="16" />
    </g>

    <!-- SOUNDWAVES RIGHT -->
    <g fill="none" stroke="#e61e2b" stroke-linecap="round" opacity="0.95">
      <path d="M 326 160 A 68 68 0 0 1 326 250" stroke-width="14" />
      <path d="M 352 135 A 105 105 0 0 1 352 275" stroke-width="15" />
      <path d="M 380 110 A 145 145 0 0 1 380 300" stroke-width="16" />
    </g>

    <!-- HEADPHONE ARCH -->
    <path d="M 216 195 A 46 46 0 1 1 296 195" fill="none" stroke="#e61e2b" stroke-width="15" stroke-linecap="round" />

    <!-- WHITE STAR -->
    <polygon points="256,112 265,134 288,135 270,149 277,171 256,157 235,171 242,149 224,135 247,134" fill="#ffffff" />

    <!-- MICROPHONE CAPSULE -->
    <rect x="204" y="158" width="104" height="106" rx="42" ry="42" fill="none" stroke="#e61e2b" stroke-width="4" />
    <g clip-path="url(#micCapsuleMask)">
      <rect x="200" y="145" width="112" height="60" fill="url(#redGradMask)" />
      <rect x="200" y="205" width="112" height="65" fill="#ffffff" />
      <line x1="200" y1="205" x2="312" y2="205" stroke="#c00" stroke-width="1.5" />
    </g>

    <!-- CRADLE & STAND -->
    <path d="M 194 185 C 194 265 256 282 256 282" fill="none" stroke="#e61e2b" stroke-width="13" stroke-linecap="round" />
    <path d="M 318 185 C 318 265 256 282 256 282" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round" />
    <line x1="251" y1="282" x2="251" y2="312" stroke="#e61e2b" stroke-width="10" />
    <line x1="261" y1="282" x2="261" y2="312" stroke="#ffffff" stroke-width="10" />
    <rect x="228" y="308" width="28" height="12" rx="3" fill="#e61e2b" />
    <rect x="256" y="308" width="28" height="12" rx="3" fill="#ffffff" />

    <!-- BRAND TYPOGRAPHY -->
    <text x="256" y="358" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-style="italic" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="3">RADIO HIT</text>
    <text x="256" y="392" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-style="italic" font-size="29" fill="#ffffff" text-anchor="middle" letter-spacing="4">INDONESIA</text>

    <!-- EQUALIZER BARS -->
    <rect x="190" y="432" width="20" height="7" rx="1.5" fill="#e61e2b" />
    <rect x="190" y="420" width="20" height="7" rx="1.5" fill="#e61e2b" />
    <rect x="190" y="408" width="20" height="7" rx="1.5" fill="#e61e2b" />

    <rect x="217" y="432" width="20" height="7" rx="1.5" fill="#ff6075" />
    <rect x="217" y="420" width="20" height="7" rx="1.5" fill="#ff6075" />

    <rect x="244" y="432" width="20" height="7" rx="1.5" fill="#cfdbff" />
    <rect x="244" y="420" width="20" height="7" rx="1.5" fill="#cfdbff" />
    <rect x="244" y="408" width="20" height="7" rx="1.5" fill="#cfdbff" />

    <rect x="271" y="432" width="20" height="7" rx="1.5" fill="#ffffff" />
    <rect x="271" y="420" width="20" height="7" rx="1.5" fill="#ffffff" />

    <rect x="298" y="432" width="20" height="7" rx="1.5" fill="#ffffff" />
    <rect x="298" y="420" width="20" height="7" rx="1.5" fill="#ffffff" />
    <rect x="298" y="408" width="20" height="7" rx="1.5" fill="#ffffff" />
  </g>
</svg>`;

function buildIco(images) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map((i) => i.buffer)]);
}

async function buildIcons() {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  fs.writeFileSync('public/icon.svg', appIconSvg.trim());
  fs.writeFileSync('public/icon-maskable.svg', maskableIconSvg.trim());

  console.log('Generating PWA and Favicon PNGs...');
  const png512 = await sharp(Buffer.from(appIconSvg)).resize(512, 512).png().toBuffer();
  fs.writeFileSync('public/pwa-512x512.png', png512);

  const png192 = await sharp(Buffer.from(appIconSvg)).resize(192, 192).png().toBuffer();
  fs.writeFileSync('public/pwa-192x192.png', png192);

  const pngMaskable512 = await sharp(Buffer.from(maskableIconSvg)).resize(512, 512).png().toBuffer();
  fs.writeFileSync('public/pwa-maskable-512x512.png', pngMaskable512);

  const png180 = await sharp(Buffer.from(appIconSvg)).resize(180, 180).png().toBuffer();
  fs.writeFileSync('public/apple-touch-icon.png', png180);

  const png64 = await sharp(Buffer.from(appIconSvg)).resize(64, 64).png().toBuffer();
  fs.writeFileSync('public/favicon.png', png64);

  const png48 = await sharp(Buffer.from(appIconSvg)).resize(48, 48).png().toBuffer();
  const png32 = await sharp(Buffer.from(appIconSvg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync('public/favicon-32x32.png', png32);

  const png16 = await sharp(Buffer.from(appIconSvg)).resize(16, 16).png().toBuffer();
  fs.writeFileSync('public/favicon-16x16.png', png16);

  // Generate real multi-frame favicon.ico
  console.log('Generating favicon.ico with 16x16, 32x32, 48x48 frames...');
  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);

  // Generate static manifest.json and manifest.webmanifest in public/
  const manifestData = {
    name: 'Radio Hit Indonesia',
    short_name: 'RadioHitID',
    description: 'Aplikasi Radio Online Hits Indonesia dengan siaran musik, berita, dan hiburan favorit.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b0e24',
    theme_color: '#0b0e24',
    orientation: 'portrait',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.png',
        sizes: '64x64',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };

  const manifestStr = JSON.stringify(manifestData, null, 2);
  fs.writeFileSync('public/manifest.json', manifestStr);
  fs.writeFileSync('public/manifest.webmanifest', manifestStr);

  console.log('All icons, favicon.ico, and manifests generated successfully!');
}

buildIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
