import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/productUtils";

export default function OrderSummary({ subtotal, shipping, total, discount }) {
    const handleApplyPromo = (e) => {
        e.preventDefault();
        const promoInput = document.getElementById('promo');
        const promoCode = promoInput?.value?.trim();

        if (!promoCode) {
            toast.warning("Please enter a promo code");
            return;
        }

        // Simulate promo code validation
        if (promoCode.toLowerCase() === "save10") {
            toast.success("Promo code applied successfully!");
            promoInput.value = "";
        } else {
            toast.error("Invalid promo code");
        }
    };

    const handleCheckout = () => {
        toast.info("Proceeding to checkout...");
    };

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold">-{formatCurrency(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">
                        {shipping === 0 ? (
                            <span className="text-green-600">FREE</span>
                        ) : (
                            formatCurrency(shipping)
                        )}
                    </span>
                </div>

                {shipping > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                        <p className="font-medium">💡 Tip: Spend {formatCurrency(1000 - subtotal)} more for FREE shipping!</p>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Promo Code */}
            <form onSubmit={handleApplyPromo} className="mb-4 sm:mb-6">
                <label htmlFor="promo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="promo"
                        placeholder="Enter code"
                        className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                    >
                        Apply
                    </Button>
                </div>
            </form>

            <Button
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 sm:py-4 mb-3 text-sm sm:text-base font-semibold hover:bg-white hover:text-primary border hover:border-primary"
            >
                Proceed to Checkout
            </Button>

            <Button
                href="/productlist"
                text={"Continue Shopping"}
                className="w-full border border-primary text-primary py-3 sm:py-4 text-sm sm:text-base font-semibold hover:bg-primary hover:text-white"
            />

            {/* Trust Badges */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>30-Day Returns</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free Shipping Over {formatCurrency(1000)}</span>
                </div>
            </div>
        </div>
    );
}
