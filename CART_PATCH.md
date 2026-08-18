# Cart page patch

The current cart has a direct **Pay Now** button that calls Paystack before the customer chooses Delivery or Collection. That bypasses the new checkout flow.

In `src/app/cart/page.tsx`, make checkout the only payment path.

## 1. Replace `handlePayNow`

Replace the current async `handlePayNow` function with:

```tsx
const handlePayNow = () => {
    if (!items.length) {
        alert("Cart is empty");
        return;
    }

    router.push("/checkout");
};
```

You can then remove these now-unused declarations if the TypeScript compiler flags them:

```tsx
const [loading, setLoading] = useState(false);
const lockRef = useRef(false);
```

If `useRef` is no longer used anywhere else in the file, remove it from the React import too.

## 2. Change the button label

Change:

```tsx
{loading ? "Processing..." : "Pay Now"}
```

to:

```tsx
Continue to Checkout
```

and remove `disabled={loading}` from that button.

## 3. Remove the duplicate checkout link

Delete the existing second button/link:

```tsx
<Link
    href="/checkout"
    className="mt-3 flex w-full items-center justify-center rounded-full bg-zinc-950 px-6 py-4 font-black text-white transition hover:bg-[#6FC276]"
>
    Continue to Delivery
</Link>
```

After this, every customer must choose either **Delivery (R100)** or **Collection (FREE)** before Paystack opens.
