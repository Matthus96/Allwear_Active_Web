# Allwear checkout modal update

New flow:

1. Customer reviews cart.
2. Customer clicks **Continue to Checkout**.
3. A modal asks:
   - **Collect — FREE**
   - **Deliver — R100**
4. The selected method is passed to `/checkout?fulfilment=...`.
5. Checkout no longer asks the customer to choose again.
6. Checkout cannot proceed without a selected method.
7. Paystack rejects any initialization request that has no valid fulfilment method.

Collection point:
**Allwear Factory Shop**
55 Albert Wessels Drive
Riverside Industrial
Newcastle

Files in this update:

- `src/components/FulfilmentModal.tsx` — new modal
- `src/app/checkout/page.tsx` — revised guarded checkout
- `src/app/api/paystack/init/route.ts` — server-side fulfilment guard
- `src/app/success/page.tsx` — same collection-aware success page from the previous update
- `CART_MODAL_PATCH.md` — small cart-page changes

No Appwrite schema change is required.
