const path = require('path');
const fs = require('fs-extra');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const rootDir = path.join(__dirname, '..');
const contentPath = path.join(rootDir, 'data', 'content.json');
const uploadsDir = path.join(rootDir, 'uploads');

function getCloudinaryConfig() {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      return {
        cloud_name: match[3],
        api_key: match[1],
        api_secret: match[2]
      };
    }
  }

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };
  }

  return null;
}

const cloudinaryConfig = getCloudinaryConfig();

if (!cloudinaryConfig) {
  console.error('Faltan credenciales de Cloudinary en backend/.env');
  process.exit(1);
}

cloudinary.config(cloudinaryConfig);

function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'vladimir-photographer',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    fs.createReadStream(filePath).on('error', reject).pipe(stream);
  });
}

async function migrate() {
  const content = await fs.readJson(contentPath);
  const uploaded = new Map();
  let changed = 0;

  async function transform(value) {
    if (Array.isArray(value)) {
      const next = [];
      for (const item of value) {
        next.push(await transform(item));
      }
      return next;
    }

    if (value && typeof value === 'object') {
      const next = {};
      for (const [key, item] of Object.entries(value)) {
        next[key] = await transform(item);
      }
      return next;
    }

    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      const fileName = path.basename(value);
      const localFilePath = path.join(uploadsDir, fileName);

      if (!await fs.pathExists(localFilePath)) {
        console.warn(`No existe el archivo local: ${localFilePath}`);
        return value;
      }

      if (uploaded.has(fileName)) {
        changed += 1;
        return uploaded.get(fileName);
      }

      const result = await uploadFile(localFilePath);
      uploaded.set(fileName, result.secure_url);
      changed += 1;
      console.log(`Subido ${fileName} -> ${result.secure_url}`);
      return result.secure_url;
    }

    return value;
  }

  const migrated = await transform(content);
  await fs.writeJson(contentPath, migrated, { spaces: 4 });

  console.log(`Migracion completada. Imágenes actualizadas: ${changed}`);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
