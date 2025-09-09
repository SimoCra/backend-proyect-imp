import {
  addToCart,
  deleteProduct,
  updateCartItem,
  getCartIdByUserId,
  getCartSummaryByUserId ,
} from '../service/productService.js';

// POST /add
export const addToCartController = async (req, res) => {
  const { cartId, productId, variantId, quantity } = req.body;

  if (!cartId || !productId || variantId == null || quantity == null) {
    return res.status(400).json({ message: 'Datos inválidos para agregar al carrito.' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ message: 'La cantidad debe ser mayor que cero.' });
  }

  try {
    const result = await addToCart(cartId, productId, variantId, quantity);
    res.json(result);
  } catch (error) {
    console.error('Error en POST /cart/add:', error);
    res.status(400).json({ message: error });
  }
};


// GET /:cartId


// DELETE /:cartId/:productId
export const deleteProductFromCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ message: 'Se requieren productId y variantId para eliminar del carrito.' });
    }

    const cartId = await getCartIdByUserId(userId);

    await deleteProduct(cartId, productId, Number(variantId));

    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (err) {
    console.error('Error al eliminar el producto del carrito:', err);
    res.status(500).json({ message: err.message || 'Error al eliminar el producto del carrito' });
  }
};




// PUT /update/:cartItemId
export const updateCartItemController = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Cantidad inválida.' });
  }

  try {
    const result = await updateCartItem(cartItemId, quantity);
    res.json(result);
  } catch (error) {
    console.error('Error en PUT /cart/update/:cartItemId:', error);
    res.status(500).json({ message: error || 'Error al actualizar el carrito.' });
  }
};

export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await getCartSummaryByUserId(userId);
    res.json(summary);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al obtener el resumen del carrito' });
  }
};


