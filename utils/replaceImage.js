import fs from 'fs';
import path from 'path';

export const replaceImage = (newImagePath, oldImagePath) => {
  if (!newImagePath) return; // No hay imagen nueva, no hacemos nada

  if (oldImagePath) {
    const oldPathResolved = path.resolve(oldImagePath);
    if (fs.existsSync(oldPathResolved)) {
      try {
        fs.unlinkSync(oldPathResolved);
        console.log(`🗑️ Imagen antigua eliminada: ${oldPathResolved}`);
      } catch (error) {
        console.warn(`⚠️ Error al eliminar imagen antigua: ${error.message}`);
      }
    }
  }
};
