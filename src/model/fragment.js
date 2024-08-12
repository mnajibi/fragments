// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const mime = require('mime-types');
const MarkdownIt = require('markdown-it');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const logger = require('../logger');
const { SUPPORTED_TYPES, TYPES, VALID_CONVERSION_EXTENSIONS, EXTENSIONS } = require('../constants');
const sharp = require('sharp');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!(type && ownerId)) {
      throw new Error("missing 'ownerId' and 'type', 'ownerId' and 'type' are required");
    }
    if (!ownerId) {
      throw new Error("missing 'ownerId', 'ownerId' is required");
    }
    if (!type) {
      throw new Error("missing 'type', 'type' is required");
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`${type} is not supported`);
    }
    if (typeof size !== 'number') {
      throw new Error(`'size' must be a number, got ${size}: ${typeof size}`);
    }
    if (size < 0) {
      throw new Error(`'size' must be a positive number, got ${size}`);
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size || 0;

    logger.debug('Fragment created: ', { fragment: this });
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      const error = new Error(`fragment id: ${id}, ownerId: ${ownerId} don't exist.`);
      error.code = 404;
      throw error;
    }

    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error(`data must be a buffer, got ${data}: ${typeof data}`);
    }
    await writeFragmentData(this.ownerId, this.id, data);
    this.updated = new Date().toISOString();
    this.size = Buffer.byteLength(data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    const { type } = contentType.parse(this.type);
    return type.includes('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    return SUPPORTED_TYPES;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return SUPPORTED_TYPES.find((type) => value.includes(type)) ? true : false;
  }

  /**
   * Convert buffer from its type to "extension" parameter
   * - get fragment's "buffer type"
   * - check if it can be converted to "target extension"
   * - convert
   * @param {string} extension
   * @param {Buffer} buffer
   * @returns
   */
  convertBuffer(extension, buffer) {
    const is_convertible = VALID_CONVERSION_EXTENSIONS[this.mimeType].includes(extension);
    if (!is_convertible) {
      throw new Error(`Can't convert "${this.type}" to "${this.to_mime_type}`);
    }

    // same type no need to convert
    if (mime.lookup(extension) === this.mimeType) {
      logger.debug(mime.lookup(extension), this.mimeType);
      logger.info(`Requesting same ${this.mimeType}, no conversion needed`);
      return buffer;
    }

    let result = buffer;
    const md = new MarkdownIt();
    switch (this.type) {
      case TYPES.TEXT_MARKDOWN:
        if (extension === EXTENSIONS.HTML) {
          result = md.render(buffer.toString());
          break;
        }
        logger.debug(`Conversion not needed from ${this.type} to ${extension}, set Content-Type`);
        break;

      case TYPES.TEXT_PLAIN:
        logger.debug(`Conversion not needed from ${this.type} to ${extension}, set Content-Type`);
        break;

      case TYPES.TEXT_HTML:
        logger.debug(`Conversion not needed from ${this.type} to ${extension}, set Content-Type`);
        break;

      case TYPES.APPLICATION_JSON:
        if (extension === EXTENSIONS.TXT) {
          result = buffer.toString();
          break;
        }
        logger.debug(`Conversion not needed from ${this.type} to ${extension}, set Content-Type`);
        break;

      default:
        if (this.type.includes('image/')) {
          result = convertImage(buffer, extension);
          break;
        }
        break;
    }
    logger.info(`Converted fragment ${this.id}'s data "${this.type}" to "${this.to_mime_type}`);
    return result;
  }
}

const convertImage = async (buffer, extension) => {
  try {
    const convertedImage = await sharp(buffer).toFormat(extension.substring(1)).toBuffer();
    return convertedImage;
  } catch (err) {
    logger.error({ err }, "Can't convert image");
    throw new Error("Can't convert image");
  }
};

module.exports.Fragment = Fragment;
