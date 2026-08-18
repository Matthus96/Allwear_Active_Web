# Cart modal update

This is the only remaining cart change.

## 1. Import the modal

In `src/app/cart/page.tsx`, add:

```tsx
import FulfilmentModal from "@/components/FulfilmentModal";
```

## 2. Add modal state

Inside `CartPage()`, add:

```tsx
const [showFulfilmentModal, setShowFulfilmentModal] = useState(false);
```

## 3. Make the cart button open the modal

Replace your current checkout/payment handler with:

```tsx
const handlePayNow = () => {
    if (!items.length) {
        alert("Cart is empty");
        return;
    }

    setShowFulfilmentModal(true);
};

const handleChooseFulfilment = (
    method: "collection" | "delivery"
) => {
    setShowFulfilmentModal(false);
    router.push(`/checkout?fulfilment=${method}`);
};
```

There must be **no Paystack `/api/paystack/init` call in the cart page**.

## 4. Use one checkout button only

The cart action should be:

```tsx
<button
    type="button"
    onClick={handlePayNow}
    className="mt-6 flex w-full items-center justify-center rounded-full bg-[#6FC276] px-6 py-4 font-black text-white transition hover:bg-zinc-950"
>
    Continue to Checkout
</button>
```

Remove the old separate `Pay Now` / `Continue to Delivery` buttons if either still exists.

## 5. Render the modal

Place this near the bottom of the component, before `<Footer />`:

```tsx
<FulfilmentModal
    open={showFulfilmentModal}
    onClose={() => setShowFulfilmentModal(false)}
    onSelect={handleChooseFulfilment}
/>
```

## Result

Cart → **Continue to Checkout** → modal:

- **Collect — FREE**
  - Allwear Factory Shop
  - 55 Albert Wessels Drive
  - Riverside Industrial
  - Newcastle

- **Deliver — R100**

Only after selecting one option does the customer reach `/checkout`.

The revised checkout page in this package also rejects direct `/checkout` access without a valid `?fulfilment=collection` or `?fulfilment=delivery` selection, and the Paystack route rejects payment initialization if no method was supplied.
