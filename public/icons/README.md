// Placeholder icons - Replace these with actual icons from a design tool or icon generator
// For hackathon, you can quickly generate these at https://realfavicongenerator.net/

// 192x192 icon
export const icon192 = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="48" fill="#3b82f6"/>
  <path d="M48 96h96v64H48z" fill="white" opacity="0.9"/>
  <rect x="56" y="64" width="80" height="8" rx="4" fill="white"/>
  <rect x="64" y="104" width="16" height="48" rx="2" fill="#3b82f6"/>
  <rect x="88" y="104" width="16" height="48" rx="2" fill="#3b82f6"/>
  <rect x="112" y="104" width="16" height="48" rx="2" fill="#3b82f6"/>
  <circle cx="70" cy="80" r="6" fill="#fbbf24"/>
  <circle cx="122" cy="80" r="6" fill="#fbbf24"/>
</svg>
`;

// 512x512 icon
export const icon512 = icon192.replace('192', '512');

console.log('Icon placeholders created. For production, use real icons from:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.figma.com/');
console.log('- https://icon.kitchen/');
