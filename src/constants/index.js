module.exports.TYPES = {
  TEXT_PLAIN: 'text/plain',
  TEXT_MARKDOWN: 'text/markdown',
  TEXT_HTML: 'text/html',
  APPLICATION_JSON: 'application/json',
  // IMAGE_PNG:
  // IMAGE_JPEG:
  // IMAGE_WEBP:
  // IMAGE_GIF:
};
module.exports.TYPES = this.TYPES;

module.exports.VALID_CONVERSION_EXTENSIONS = {
  'text/markdown': ['.md', '.html', '.txt'],
  'text/html': ['.html', '.txt'],
  'application/json': ['.json', '.txt'],
  'image/png': ['.png', '.jpg', '.webp', '.gif'],
  'image/jpeg': ['.png', '.jpg', '.webp', '.gif'],
  'image/webp': ['.png', '.jpg', '.webp', '.gif'],
  'image/gif': ['.png', '.jpg', '.webp', '.gif'],
};

module.exports.SUPPORTED_TYPES = [
  this.TYPES.TEXT_PLAIN,
  this.TYPES.TEXT_HTML,
  this.TYPES.TEXT_MARKDOWN,
  this.TYPES.APPLICATION_JSON,
];

module.exports.EXTENSIONS = {
  TXT: '.txt',
  MD: '.md',
  HTML: '.html',
  JSON: '.json',
};
