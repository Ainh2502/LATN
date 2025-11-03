export class UpdateOrderDto {
  paymentStatus?: string;        // 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  fulfillmentStatus?: string;    // 'DRAFT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  discountTotal?: number;
  shippingFee?: number;
  grandTotal?: number;
  appliedCouponCode?: string;
}
