import BespokeBrandShowcase from "@/components/bespoke/BespokeBrandShowcase";

export const metadata = {
    title: "Bespoke Brand Showcase | ArcMat",
    description: "A premium bespoke brand microsite for collections, products, catalogs, videos, retailers, contractors, reviews, and inquiries.",
    openGraph: {
        title: "Bespoke Brand Showcase | ArcMat",
        description: "Explore a luxury brand page built for architectural products, collections, partners, and custom project inquiries.",
        type: "website",
    },
};

export default function BespokeBrandPage() {
    return <BespokeBrandShowcase />;
}
