import api from "../api/axios";

export const WishlistService = {
  async add(productId: string, userId: string) {
    const res = await api.post("/wishlist", { userId, productId });
    return res.data;
  },
  async remove(productId: string, userId: string) {
    const res = await api.delete("/wishlist", { data: { userId, productId } });
    return res.data;
  },
  async getAll(userId: string) {
    const res = await api.get("/wishlist", { params: { userId } });
    return res.data;
  },
};
