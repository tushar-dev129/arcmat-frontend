/**
 * Generates a URL-friendly slug from a string.
 */
export const generateSlug = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

/**
 * Formats a string as an uppercase SKU.
 */
export const formatSKU = (text) => {
    if (!text) return '';
    return text.toUpperCase().trim().replace(/\s+/g, '-');
};

/**
 * Universal helper to resolve image URLs.
 * Handles:
 * 1. Cloudinary objects: { public_id, secure_url }
 * 2. Absolute URLs: http://... or https://...
 * 3. Data URLs: data:...
 * 4. Absolute paths: /...
 * 5. Legacy relative paths: "filename.jpg" or "brandId/filename.jpg"
 * 
 * @param {string|object} image - The image path or object
 * @param {string} folder - The upload folder (product, category, banner, website, etc.)
 */
export const getImageUrl = (image, folder = 'product') => {
    if (!image) return null;

    // Handle Cloudinary object
    if (typeof image === 'object' && image.secure_url) {
        return image.secure_url;
    }

    // Pass through if already a full URL or absolute path
    if (typeof image === 'string') {
        if (image.startsWith('http') || image.startsWith('data:') || image.startsWith('blob:') || image.startsWith('/')) {
            return image;
        }

        // Normalize protocol-relative URLs (//example.com) to https
        if (image.startsWith('//')) {
            return `https:${image}`;
        }

        // Clean legacy path and construct URL
        const cleanPath = image.replace(/^\/+/, '');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        return `${apiUrl}/public/uploads/${folder}/${cleanPath}`;
    }

    return null;
};

/**
 * Resolves the full URL for a product image.
 */
export const getProductImageUrl = (imgName) => {
    return getImageUrl(imgName, 'product') || '/Icons/arcmatlogo.svg';
};

/**
 * Resolves the full URL for a variant image.
 * Note: Variant images are historically stored in the product folder in some versions,
 * but consistently using the 'product' folder for both handles brand-prefixed paths.
 */
export const getVariantImageUrl = (imgName) => {
    return getImageUrl(imgName, 'product') || '/Icons/arcmatlogo.svg';
};

/**
 * Resolves the full URL for a category image.
 */
export const getCategoryImageUrl = (imgName) => {
    return getImageUrl(imgName, 'category') || '/Icons/arcmatlogo.svg';
};

/**
 * Resolves the full URL for a banner image.
 */
export const getBannerImageUrl = (imgName) => {
    return getImageUrl(imgName, 'banner') || '/Icons/arcmatlogo.svg';
};

/**
 * Resolves the full URL for a brand logo.
 */
export const getBrandImageUrl = (imgName) => {
    return getImageUrl(imgName, 'brand') || '/Icons/arcmatlogo.svg';
};



/**
 * Formats a number as a currency string (INR).
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

/**
 * Parses dynamic attributes if they are in JSON string format.
 */
export const parseAttributes = (attributes) => {
    if (!attributes) return [];
    if (typeof attributes === 'string') {
        try {
            return JSON.parse(attributes);
        } catch (e) {
            return [];
        }
    }
    return attributes;
};

/**
 * Normalizes attribute keys so case and stray spacing do not create duplicates.
 */
export const normalizeAttributeKey = (value) => {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

/**
 * Normalizes attribute values for comparison and deduplication.
 */
export const normalizeAttributeValue = (value) => {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

/**
 * Formats a normalized attribute key into a stable display label.
 */
export const formatAttributeLabel = (value) => {
    const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return '';

    return cleaned
        .toLowerCase()
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

/**
 * Collapses duplicate metadata attributes by normalized key and value.
 */
export const normalizeAvailableAttributes = (attributes = []) => {
    const grouped = new Map();

    attributes.forEach((attribute) => {
        const rawKey = attribute?.key || attribute?.label || attribute?.attributeName;
        const normalizedKey = normalizeAttributeKey(rawKey);
        if (!normalizedKey) return;

        if (!grouped.has(normalizedKey)) {
            grouped.set(normalizedKey, {
                key: normalizedKey,
                label: formatAttributeLabel(rawKey),
                _values: new Map()
            });
        }

        const entry = grouped.get(normalizedKey);
        (attribute?.values || []).forEach((rawValue) => {
            const displayValue = String(rawValue || '').trim().replace(/\s+/g, ' ');
            const normalizedValue = normalizeAttributeValue(displayValue);
            if (!normalizedValue) return;

            if (!entry._values.has(normalizedValue)) {
                entry._values.set(normalizedValue, displayValue);
            }
        });
    });

    return Array.from(grouped.values())
        .map((entry) => ({
            key: entry.key,
            label: entry.label,
            values: Array.from(entry._values.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        }))
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
};

/**
 * Maps color names to CSS hex codes.
 */
const COLOR_KEYWORDS = [
    ['off white', '#f5f5f4'],
    ['warm white', '#f8f4e8'],
    ['cool white', '#eef6ff'],
    ['ivory', '#fff8e7'],
    ['cream', '#fff3d6'],
    ['pearl', '#f5f1e8'],
    ['linen', '#f4efe4'],
    ['bone', '#ede3d3'],
    ['almond', '#ead8b1'],
    ['beige', '#e8dcc3'],
    ['sand', '#d6c3a1'],
    ['stone', '#b8b0a2'],
    ['greige', '#b7aa97'],
    ['taupe', '#8b7d6b'],
    ['tan', '#c19a6b'],
    ['brown', '#78350f'],
    ['chocolate', '#5b3a29'],
    ['coffee', '#6f4e37'],
    ['walnut', '#6b4f3a'],
    ['oak', '#b98b5f'],
    ['teak', '#a97142'],
    ['wood', '#9a6b3f'],
    ['natural', '#c2a878'],
    ['black', '#111827'],
    ['charcoal', '#364152'],
    ['graphite', '#4b5563'],
    ['ash', '#9ca3af'],
    ['smoke', '#94a3b8'],
    ['slate', '#64748b'],
    ['grey', '#6b7280'],
    ['gray', '#6b7280'],
    ['silver', '#c0c0c0'],
    ['white', '#ffffff'],
    ['red', '#ef4444'],
    ['maroon', '#800000'],
    ['burgundy', '#7f1d1d'],
    ['pink', '#ec4899'],
    ['rose', '#f43f5e'],
    ['orange', '#f97316'],
    ['terracotta', '#c96f4a'],
    ['yellow', '#eab308'],
    ['gold', '#d4a017'],
    ['green', '#22c55e'],
    ['olive', '#708238'],
    ['sage', '#9caf88'],
    ['mint', '#98ff98'],
    ['blue', '#3b82f6'],
    ['navy', '#1e3a8a'],
    ['teal', '#0f766e'],
    ['cyan', '#06b6d4'],
    ['purple', '#a855f7'],
    ['lavender', '#c4b5fd'],
];

const hashStringToHue = (value) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = value.charCodeAt(index) + ((hash << 5) - hash);
        hash |= 0;
    }
    return Math.abs(hash) % 360;
};

const parseHexChannel = (value) => Number.parseInt(value, 16);

const parseHexColor = (value) => {
    const normalized = String(value || '').trim().replace('#', '');
    if (!/^[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(normalized)) return null;

    if (normalized.length === 3) {
        return {
            r: parseHexChannel(normalized[0] + normalized[0]),
            g: parseHexChannel(normalized[1] + normalized[1]),
            b: parseHexChannel(normalized[2] + normalized[2])
        };
    }

    return {
        r: parseHexChannel(normalized.slice(0, 2)),
        g: parseHexChannel(normalized.slice(2, 4)),
        b: parseHexChannel(normalized.slice(4, 6))
    };
};

export const getColorCode = (colorName) => {
    if (!colorName) return 'transparent';
    const rawValue = String(colorName).trim();
    const name = rawValue.toLowerCase();

    if (
        /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(rawValue) ||
        /^(rgb|rgba|hsl|hsla)\(/i.test(rawValue)
    ) {
        return rawValue;
    }

    const keywordMatch = COLOR_KEYWORDS.find(([keyword]) => name.includes(keyword));
    if (keywordMatch) {
        return keywordMatch[1];
    }

    const tokenMatch = name
        .split(/[^a-z]+/)
        .filter(Boolean)
        .map((token) => COLOR_KEYWORDS.find(([keyword]) => keyword === token))
        .find(Boolean);

    if (tokenMatch) {
        return tokenMatch[1];
    }

    const hue = hashStringToHue(name);
    return `hsl(${hue} 45% 62%)`;
};

export const isLightColorName = (colorName) => {
    const rawValue = String(colorName || '').trim();
    if (!rawValue) return false;

    const hexRgb = rawValue.startsWith('#') ? parseHexColor(rawValue) : null;
    if (hexRgb) {
        const luminance = ((hexRgb.r * 299) + (hexRgb.g * 587) + (hexRgb.b * 114)) / 1000;
        return luminance >= 210;
    }

    const name = rawValue.toLowerCase();
    return [
        'white',
        'ivory',
        'cream',
        'beige',
        'silver',
        'sand',
        'pearl',
        'linen',
        'bone',
        'almond',
        'stone',
        'ash'
    ].some((token) => name.includes(token));
};

/**
 * Calculates discount percentage.
 */
export const calculateDiscount = (mrp, price) => {
    if (!mrp || !price || Number(mrp) <= Number(price)) return 0;
    return Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100);
};

/**
 * Formats a number with Indian numbering system (with commas).
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-IN');
};

/**
 * Resolves pricing (Price and MRP) from product or variant.
 */
export const resolvePricing = (product, selectedVariant = null) => {
    const currentItem = selectedVariant || product;
    if (!currentItem) return { price: 0, mrp: 0, hasPrice: false, hasMrp: false };

    const price = currentItem.selling_price || currentItem.price || product?.minPrice || product?.selling_price;
    const mrp = currentItem.mrp_price || currentItem.mrp || product?.mrp_price || product?.mrp;

    return {
        price: Number(price) || 0,
        mrp: Number(mrp) || 0,
        hasPrice: Boolean(price && Number(price) > 0),
        hasMrp: Boolean(mrp && Number(mrp) > 0)
    };
};

/**
 * Aggregates specifications from product and variant.
 */
export const getSpecifications = (product, selectedVariant = null) => {
    if (!product) return [];

    const parseAttrs = (attrs) => {
        if (!attrs) return [];
        return typeof attrs === 'string' ? JSON.parse(attrs) : attrs;
    };

    const dynamicAttributes = parseAttrs(product.dynamicAttributes);
    const variantDynamicAttributes = selectedVariant ? parseAttrs(selectedVariant.dynamicAttributes) : [];

    const displayWeight = selectedVariant?.weight
        ? `${selectedVariant.weight} ${selectedVariant.weight_type || selectedVariant.weight_unit || 'kg'}`
        : (product.weight ? `${product.weight} ${product.weight_type || 'kg'}` : null);

    const allSpecs = [
        ...dynamicAttributes.map(a => ({ label: a.attributeName || a.key, value: a.attributeValue || a.value })),
        ...variantDynamicAttributes.map(a => ({ label: a.attributeName || a.key, value: a.attributeValue || a.value })),
        ...(selectedVariant ? [
            { label: 'Color', value: selectedVariant.color },
            { label: 'Size', value: selectedVariant.size },
            { label: 'Weight', value: displayWeight },
            { label: 'SKU', value: selectedVariant.skucode || selectedVariant._id }
        ] : [])
    ].filter(attr => attr.value !== undefined && attr.value !== null && attr.value !== '' && attr.value !== 'null' && attr.value !== 'undefined');

    // Filter duplicates by case-insensitive label
    const seen = new Set();
    return allSpecs.filter(item => {
        const labelSafe = (item.label || '').toLowerCase();
        if (seen.has(labelSafe)) return false;
        seen.add(labelSafe);
        return true;
    });
};

/**
 * Robust helper to resolve the best possible product name.
 */
export const getProductName = (v) => {
    if (!v) return 'Untitled';
    return (
        v.name ||
        v.product_name ||
        (typeof v.productId === 'object' ? v.productId?.product_name : null) ||
        'Untitled Material'
    );
};

/**
 * Robust helper to resolve the best possible category name.
 */
export const getProductCategory = (v) => {
    if (!v) return 'Material';
    const product = typeof v.productId === 'object' ? v.productId : null;
    return (
        (typeof v.categoryId === 'object' ? v.categoryId?.name : null) ||
        (product && typeof product.categoryId === 'object' ? product.categoryId?.name : null) ||
        v.category ||
        v.product_type ||
        (product?.category) ||
        'Material'
    );
};

/**
 * Robust helper to resolve the brand or vendor name.
 */
export const getProductBrand = (v) => {
    if (!v) return '';
    const product = typeof v.productId === 'object' ? v.productId : null;
    return (
        (typeof v.brand === 'object' ? v.brand?.name : v.brand) ||
        v.vendorId?.name ||
        (product && (typeof product.brand === 'object' ? product.brand?.name : product.brand)) ||
        (product && product.createdBy?.name) ||
        ''
    );
};

/**
 * Robust helper to resolve the size.
 */
export const getProductSize = (v) => {
    if (!v) return '';
    return v.size || (typeof v.productId === 'object' ? v.productId?.size : null) || '';
};

/**
 * Robust helper to resolve the best possible thumbnail image.
 */
export const getProductThumbnail = (v) => {
    if (!v) return '/Icons/arcmatlogo.svg';
    if (v.isCustomPhoto && v.photoUrl) return v.photoUrl;

    const firstImg = v.product_images?.[0] || v.images?.[0] || v.variant_images?.[0] || v.image || v.thumbnail;
    if (firstImg) return getImageUrl(firstImg, 'product');

    const product = typeof v.productId === 'object' ? v.productId : null;
    const prodImg = product?.product_images?.[0] || product?.images?.[0];
    if (prodImg) return getImageUrl(prodImg, 'product');

    return '/Icons/arcmatlogo.svg';
};
export const isProfileComplete = (brand) => {
    const requiredFields = [
        { key: 'name', label: 'Brand Name' },
        { key: 'logo', label: 'Logo' },
        { key: 'description', label: 'Description' },
        { key: 'website', label: 'Website' },
        { key: 'shippingAddress', label: 'Shipping Address' },
        { key: 'billingAddress', label: 'Billing Address' }
    ];

    if (!brand || typeof brand !== 'object') {
        return {
            complete: false,
            missingFields: ['Brand Profile']
        };
    }

    const missingFields = [];

    requiredFields.forEach(field => {
        const value = brand[field.key];
        let isFieldMissing = false;

        // Basic falsy check (handles null, undefined, empty string)
        if (!value) {
            isFieldMissing = true;
        }
        // String check (no whitespace only)
        else if (typeof value === 'string' && value.trim() === '') {
            isFieldMissing = true;
        }
        // Array check (no empty arrays)
        else if (Array.isArray(value) && value.length === 0) {
            isFieldMissing = true;
        }
        // Object check (no empty objects)
        else if (typeof value === 'object' && !Array.isArray(value)) {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                isFieldMissing = true;
            } else if (field.key === 'logo' && !(value.secure_url || value.public_id)) {
                // Special check for logo object
                isFieldMissing = true;
            }
        }

        if (isFieldMissing) {
            missingFields.push(field.label);
        }
    });

    return {
        complete: missingFields.length === 0,
        missingFields
    };
};
/**
 * Generates a unique product ID based on timestamp and randomness.
 * Format: PRD-[TIMESTAMP]-[RANDOM]
 */
export const generateProductUniqueID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PRD-${timestamp}-${randomStr}`;
};

/**
 * Traverses a category tree to find the path to a specific category ID.
 * @param {Array} tree - The category tree
 * @param {string} targetId - The ID to look for
 * @returns {Array} Array of { name, id } representing the path
 */
export const getCategoryPath = (tree, targetId) => {
    if (!targetId || targetId === 'All') return [];
    if (!Array.isArray(tree)) return [];

    let path = [];
    const traverse = (nodes, currentPath = []) => {
        for (const node of nodes) {
            const nodeId = node._id || node.id;
            const nextPath = [...currentPath, { name: node.name, id: nodeId }];
            
            if (nodeId === targetId) {
                path = nextPath;
                return true;
            }
            if (node.children?.length > 0) {
                if (traverse(node.children, nextPath)) return true;
            }
        }
        return false;
    };
    traverse(tree);
    return path;
};
