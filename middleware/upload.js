import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Firmas HEX válidas
const firmasPermitidas = [
  'ffd8ffe0', // JPG
  'ffd8ffe1', // JPG
  '89504e47'  // PNG
];

// Almacenamiento dinámico por ruta
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others'; // default

    if (req.originalUrl.includes('/user')) {
      folder = 'uploads/users';
    } else if (req.originalUrl.includes('/product')) {
      folder = 'uploads/products';
    } else if (req.originalUrl.includes('/category')) {
      folder = 'uploads/categories';
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

// Validar tipo MIME por cabecera
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes .jpg, .jpeg y .png'), false);
  }
};

// Multer con validación
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máx
});

// Función para validar la firma HEX
export const validarFirmaHex = (req, res, next) => {
  // Soporta single o multiple
  const files = req.files || (req.file ? [req.file] : []);

  try {
    for (const file of files) {
      const buffer = fs.readFileSync(file.path);
      const firmaHex = buffer.subarray(0, 4).toString('hex');

      if (!firmasPermitidas.includes(firmaHex)) {
        fs.unlinkSync(file.path);
        console.log(`❌ Firma no válida: ${firmaHex} (${file.originalname})`);
        return res.status(400).send('Archivo con firma no válida');
      }

      console.log(`✅ Firma válida: ${firmaHex} (${file.originalname})`);
    }
    next();
  } catch (error) {
    console.error('Error al verificar la firma del archivo:', error);
    return res.status(500).send('Error al verificar la firma del archivo');
  }
};


export const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) return reject(new Error('No se proporcionó archivo'));

      // Carpeta destino: uploads/products
      const uploadDir = path.join('uploads', 'products');
      fs.mkdirSync(uploadDir, { recursive: true });

      // Nombre único: timestamp + originalname
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);

      // Mover el archivo de la carpeta temporal de multer a uploads/products
      fs.rename(file.path, filePath, (err) => {
        if (err) return reject(err);

        // Retornamos la ruta relativa para guardar en la BD
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};