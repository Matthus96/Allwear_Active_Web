# Allwear collection checkout update

This update adds:

- Delivery or Collection selection at checkout.
- Collection is free.
- All collections use:
  Allwear Factory Shop
  55 Albert Wessels Drive
  Riverside Industrial
  Newcastle
- Delivery remains R100.
- Delivery address fields are hidden for collection.
- Collection/delivery method is saved into Paystack metadata and the order gateway response.
- Existing coupon/QR coupon codes stored in `allwear_coupon` are revalidated at checkout.
- The success page confirms collection and shows the factory shop address.

Replace these files:

1. `src/app/checkout/page.tsx`
2. `src/app/api/paystack/init/route.ts`
3. `src/app/success/page.tsx`

Then apply `CART_PATCH.md` to `src/app/cart/page.tsx` so customers cannot bypass the fulfilment choice with the old direct Pay Now button.

No Appwrite schema change is required for this version because the fulfilment data is stored inside the existing `gateway_response` JSON string.
