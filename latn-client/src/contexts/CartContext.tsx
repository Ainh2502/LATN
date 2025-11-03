import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

export type CartItem = {
  id: string;
  quantity: number;
  priceSnap: number;
  variant?: {
    id: string;
    optionJson?: { size?: string; color?: string };
    product?: {
      id: string;
      name: string;
      price: number;
      images?: { url: string }[];

      // 🧩 Thêm các field mới để hiển thị đầy đủ
      brand?: { id: string; name: string };
      category?: { id: string; name: string };
      finalPrice?: number;
      appliedPromotion?: { id: string; name: string; type: string; value: number } | null;
    };
  };
};


type CartCtx = {
  items: CartItem[];
  refresh: () => Promise<void>;
  add: (data: { productId: string; quantity?: number; variantId?: string }) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const Ctx = createContext<CartCtx>({} as CartCtx);
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

const refresh = async () => {
  try {
    const res = await api.get('/cart');
    const data = Array.isArray(res.data?.items) ? res.data.items : [];
    setItems(data);
  } catch (err) {
    console.error("🧺 Lỗi load giỏ hàng:", err);
    setItems([]);
  }
};


  const add = async ({ productId, quantity = 1, variantId }: { productId: string; quantity?: number; variantId?: string }) => {
    await api.post('/cart/items', { productId, quantity, variantId });
    await refresh();
  };

  const updateQty = async (itemId: string, quantity: number) => {
    await api.patch(`/cart/items/${itemId}`, { quantity });
    await refresh();
  };

  const remove = async (itemId: string) => {
    await api.delete(`/cart/items/${itemId}`);
    await refresh();
  };

  const clear = async () => {
    await api.delete('/cart/clear');
    await refresh();
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{ items, refresh, add, updateQty, remove, clear }}>
      {children}
    </Ctx.Provider>
  );
}
