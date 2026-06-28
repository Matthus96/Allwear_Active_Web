import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-zinc-100 bg-zinc-950 text-white">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-14">
                <div className="lg:col-span-2">
                    <Link href="/" className="inline-flex items-center">
                        <img
                            src="/images/Logo.png"
                            alt="Allwear Logo"
                            className="h-auto w-[130px] object-contain sm:w-[170px]"
                        />
                    </Link>

                    <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
                        Premium activewear and lifestyle apparel designed for
                        comfort, movement and everyday performance.
                    </p>
                </div>

                <div>
                    <h3 className="font-black">Shop</h3>

                    <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
                        <Link href="/shop" className="hover:text-white">
                            All Products
                        </Link>
                        <Link href="/shop" className="hover:text-white">
                            Activewear
                        </Link>
                        <Link href="/cart" className="hover:text-white">
                            Cart
                        </Link>
                    </div>
                </div>

                <div>
                    <h3 className="font-black">Support</h3>

                    <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
                        <p className="break-words">info@allwear.co.za</p>
                        <p>Newcastle, South Africa</p>
                        <p>Delivery: R100.00</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-zinc-500">
                © {new Date().getFullYear()} Allwear Active. All rights
                reserved.
            </div>
        </footer>
    );
}