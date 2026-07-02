import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-zinc-100 bg-zinc-950 text-white">
            <div className="site-container grid grid-cols-[1.2fr_0.8fr] gap-x-[clamp(1rem,4vw,2.5rem)] gap-y-[clamp(1rem,3vw,2rem)] py-[clamp(1.25rem,4vw,3.5rem)] md:grid-cols-4">
                <div className="min-w-0 md:col-span-2">
                    <Link href="/" className="inline-flex items-center">
                        <img
                            src="/images/Logo.png"
                            alt="Allwear Logo"
                            className="h-auto w-[clamp(5.5rem,18vw,10.625rem)] object-contain"
                        />
                    </Link>

                    <p className="mt-[clamp(0.5rem,1.5vw,1rem)] max-w-md text-[clamp(0.65rem,1.5vw,0.875rem)] leading-[1.5] text-zinc-400">
                        Allwear Hub is a growing digital storefront for Allwear
                        products, collections and future divisions.
                    </p>
                </div>

                <div className="min-w-0">
                    <h3 className="text-[clamp(0.8rem,1.8vw,1rem)] font-black">
                        Shop
                    </h3>

                    <div className="mt-[clamp(0.5rem,1.5vw,1rem)] flex flex-col gap-[clamp(0.3rem,1vw,0.75rem)] text-[clamp(0.65rem,1.5vw,0.875rem)] text-zinc-400">
                        <Link href="/shop" className="transition hover:text-white">
                            All Products
                        </Link>
                        <Link href="/#divisions" className="transition hover:text-white">
                            Collections
                        </Link>
                        <Link href="/cart" className="transition hover:text-white">
                            Cart
                        </Link>
                        <Link href="/orders" className="transition hover:text-white">
                            Orders
                        </Link>
                    </div>
                </div>

                <div className="col-span-2 min-w-0 md:col-span-1">
                    <h3 className="text-[clamp(0.8rem,1.8vw,1rem)] font-black">
                        Support
                    </h3>

                    <div className="mt-[clamp(0.5rem,1.5vw,1rem)] flex flex-wrap gap-x-4 gap-y-[clamp(0.25rem,1vw,0.75rem)] text-[clamp(0.65rem,1.5vw,0.875rem)] leading-[1.4] text-zinc-400 md:flex-col">
                        <p className="break-words">info@allwear.co.za</p>
                        <p>Newcastle, South Africa</p>
                        <p>Delivery: R100.00</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 px-[clamp(0.75rem,3vw,1.5rem)] py-[clamp(0.6rem,2vw,1.25rem)] text-center text-[clamp(0.55rem,1.3vw,0.75rem)] leading-4 text-zinc-500">
                Anomalie Devs © {new Date().getFullYear()} Allwear Hub. All
                rights reserved.
            </div>
        </footer>
    );
}