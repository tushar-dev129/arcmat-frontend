import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { toast } from 'sonner';
import {
    getProductThumbnail,
    getProductName,
    getProductBrand,
    getProductCategory,
    resolvePricing,
    getImageUrl,
} from '@/lib/productUtils';

// ===========================================================================
// DESIGN TOKENS
// ===========================================================================
const COLORS = {
    PRIMARY:   'FF2D3748', // Dark Slate
    SECONDARY: 'FF718096', // Slate Gray
    ACCENT:    'FFD9A88A', // Arcmat Beige/Gold
    SUCCESS:   'FF38A169', // Green
    WHITE:     'FFFFFFFF',
    LIGHT_BG:  'FFF7FAFC',
    BORDER:    'FFE2E8F0',
    EVEN_ROW:  'FFFEFEFE',
    ODD_ROW:   'FFF7FAFC',
};

const STYLES = {
    headerMain: {
        font: { bold: true, size: 16, color: { argb: COLORS.PRIMARY } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT_BG } },
    },
    headerSpace: {
        font: { bold: true, size: 12, color: { argb: COLORS.WHITE } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } },
        alignment: { vertical: 'middle', horizontal: 'center' },
    },
    tableHeader: {
        font: { bold: true, color: { argb: COLORS.WHITE } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: { bottom: { style: 'thin', color: { argb: COLORS.BORDER } } },
    },
    cellStandard: {
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    },
    cellLeft: {
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
    },
    total: {
        font: { bold: true, size: 11, color: { argb: COLORS.PRIMARY } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } },
        border: { top: { style: 'medium', color: { argb: COLORS.BORDER } } },
        alignment: { vertical: 'middle', horizontal: 'center' },
    },
};

// ===========================================================================
// PRIVATE HELPERS
// ===========================================================================

/**
 * Safely fetches a URL with up to `retries` attempts.
 * Returns ArrayBuffer or null (never throws).
 */
const safeFetch = async (url, retries = 2) => {
    if (!url || typeof url !== 'string') return null;

    // Handle data URLs immediately without fetch()
    if (url.startsWith('data:')) {
        try {
            const base64Content = url.split(',')[1];
            if (!base64Content) return null;
            
            // Standard browser way to convert base64 to ArrayBuffer
            const binaryString = atob(base64Content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        } catch (err) {
            console.error(`[safeFetch] Data URL decoding failed:`, err);
            return null;
        }
    }

    // Handle relative URLs or URLs pointing to localhost if on a different origin
    let targetUrl = url;
    if (url.startsWith('/')) {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
        targetUrl = `${apiUrl}${url}`;
    }

    // Attempt to force HTTPS if the current page is HTTPS and the URL is HTTP
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && targetUrl.startsWith('http:')) {
        // Only force if it's not localhost
        if (!targetUrl.includes('localhost')) {
            targetUrl = targetUrl.replace('http:', 'https:');
        }
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const res = await fetch(targetUrl, { 
                cache: 'no-store',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) return await res.arrayBuffer();
            
            console.warn(`[safeFetch] Attempt ${attempt} HTTP ${res.status} for ${targetUrl}`);
        } catch (err) {
            clearTimeout(timeoutId);
            const isTimeout = err.name === 'AbortError';
            
            if (attempt === retries) {
                console.error(`[safeFetch] Final attempt failed for ${targetUrl}:`, isTimeout ? 'Timeout (10s)' : err.message);
            } else {
                console.warn(`[safeFetch] Attempt ${attempt} failed [${isTimeout ? 'Timeout' : 'Network Error'}]. Retrying...`);
            }

            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
            }
        }
    }
    return null;
};

/** Sanitize a string into a safe folder / file name. */
const sanitize = (str, fallback = 'untitled') =>
    (str || fallback).replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-').trim() || fallback;

/** Extract extension from a URL or data URL. */
const getExtFromUrl = (url, fallback = 'jpg') => {
    if (!url) return fallback;
    if (typeof url !== 'string') return fallback;
    if (url.startsWith('data:image/')) {
        const match = url.match(/^data:image\/([^;]+)/);
        return match ? match[1].replace('jpeg', 'jpg') : fallback;
    }
    const parts = url.split('.');
    if (parts.length < 2) return fallback;
    const ext = parts.pop().toLowerCase().split(/[?#]/)[0];
    return ext.length > 4 || ext.length < 2 ? fallback : ext;
};

/** Trigger a browser file download from a Blob or ArrayBuffer. */
const triggerDownload = (blobOrBuffer, filename, mimeType = 'application/octet-stream') => {
    const blob =
        blobOrBuffer instanceof Blob
            ? blobOrBuffer
            : new Blob([blobOrBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

 /** Build a plain text README for a space folder. */
const buildSpaceReadme = (moodboard, project, stats) => {
    const now = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    return [
        '='.repeat(60),
        `  ARCMAT — Space Export`,
        '='.repeat(60),
        '',
        `  Space     : ${moodboard?.moodboard_name || 'Untitled'}`,
        `  Project   : ${project?.projectName || 'N/A'}`,
        `  Client    : ${project?.clientName || 'N/A'}`,
        `  Phase     : ${project?.phase || 'N/A'}`,
        `  Exported  : ${now}`,
        '',
        '-'.repeat(60),
        '  CONTENTS',
        '-'.repeat(60),
        `  • reports/${sanitize(moodboard?.moodboard_name, 'space')}-report.xlsx  — Full material spec sheet with images`,
        `  • reports/${sanitize(moodboard?.moodboard_name, 'space')}-materials.csv — Lightweight CSV for spreadsheet apps`,
        stats.hasProducts  ? `  • products/   — ${stats.productCount} product thumbnail image(s)` : null,
        stats.hasRenders   ? `  • renders/    — ${stats.renderCount} visual render image(s)` : null,
        stats.hasPhotos    ? `  • photos/     — ${stats.photoCount} custom upload image(s)` : null,
        stats.hasCover     ? `  • canvas/     — Space design snapshots & cover image` : null,
        '',
        '-'.repeat(60),
        '  ESTIMATED COST',
        '-'.repeat(60),
        `  Total : ₹${stats.total.toLocaleString('en-IN')}`,
        '',
        '  Generated by ArcMat — https://arcmat.in',
        '='.repeat(60),
    ]
        .filter((l) => l !== null)
        .join('\n');
};

/** Build a plain text README for a full project folder. */
const buildProjectReadme = (project, moodboards, grandTotal) => {
    const now = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const spaceLines = moodboards
        .filter(Boolean)
        .map((mb, i) => `  ${String(i + 1).padStart(2, '0')}. ${mb.moodboard_name || 'Untitled'}`)
        .join('\n');

    return [
        '='.repeat(60),
        '  ARCMAT — Project Export',
        '='.repeat(60),
        '',
        `  Project   : ${project?.projectName || 'N/A'}`,
        `  Client    : ${project?.clientName || 'N/A'}`,
        `  Phase     : ${project?.phase || 'N/A'}`,
        `  Status    : ${project?.status || 'Active'}`,
        `  Spaces    : ${moodboards.filter(Boolean).length}`,
        `  Exported  : ${now}`,
        '',
        '-'.repeat(60),
        '  SPACES INCLUDED',
        '-'.repeat(60),
        spaceLines,
        '',
        '-'.repeat(60),
        '  CONTENTS',
        '-'.repeat(60),
        `  • reports/<project-name>-summary.xlsx — Multi-sheet project report`,
        `  • <SpaceName>/                — Per-space folder`,
        `    ├── reports/                — Excel & CSV material sheets`,
        `    ├── canvas/                 — Space cover & design snapshot`,
        `    ├── products/               — Product thumbnails`,
        `    ├── renders/                — Visual renders`,
        `    └── photos/                 — Custom uploads`,
        '',
        '-'.repeat(60),
        '  TOTAL ESTIMATED PROJECT VALUE',
        '-'.repeat(60),
        `  ₹${grandTotal.toLocaleString('en-IN')}`,
        '',
        '  Generated by ArcMat — https://arcmat.in',
        '='.repeat(60),
    ].join('\n');
};

/**
 * Build a CSV string for one moodboard.
 * Columns: #, Name, Brand, Category, Unique Code, Spec Status, Qty, Unit Price (₹), Total (₹)
 */
const buildSpaceCSV = (moodboard, project) => {
    const activeProducts = moodboard?.estimatedCostId?.products || [];
    const customPhotos   = (moodboard?.customPhotos || []).filter(p => !(p.tags || []).includes('Render'));
    const customRows     = moodboard?.customRows || [];
    const productStatuses = moodboard?.productMetadata || {};

    const escape = (v) => {
        const s = String(v ?? '').replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };

    const headers = ['#', 'Name', 'Brand', 'Category', 'Unique Code', 'Spec Status', 'Qty', 'Unit Price (₹)', 'Total (₹)', 'Type'];
    const rows = [headers.map(escape).join(',')];

    let idx = 1;

    for (const p of activeProducts) {
        const meta = productStatuses[p._id] || {};
        const qty  = Number(meta.quantity) || 1;
        let price  = 0;
        if (typeof meta === 'object' && meta.price !== undefined) {
            price = Number(meta.price);
        } else {
            const { price: dp } = resolvePricing(p);
            price = dp;
        }
        rows.push([
            idx++,
            getProductName(p),
            getProductBrand(p),
            getProductCategory(p),
            p?.product_unique_id || '',
            meta.status || 'Considering',
            qty,
            price,
            qty * price,
            'Product',
        ].map(escape).join(','));
    }

    for (const ph of customPhotos) {
        const qty = Number(ph.quantity) || 1;
        const price = Number(ph.price) || 0;
        rows.push([
            idx++,
            ph.title || 'Custom Photo',
            'Custom Upload',
            '',
            '',
            ph.status || 'Considering',
            qty,
            price,
            qty * price,
            'Custom Photo',
        ].map(escape).join(','));
    }

    for (const r of customRows) {
        const qty = Number(r.quantity) || 1;
        const price = Number(r.price) || 0;
        rows.push([
            idx++,
            r.title || 'Custom Row',
            'Custom Row',
            '',
            '',
            r.status || 'Considering',
            qty,
            price,
            qty * price,
            'Custom Row',
        ].map(escape).join(','));
    }

    // Totals row
    rows.push('');
    rows.push(['', '', '', '', '', '', '', 'Project', escape(project?.projectName || 'ArcMat'), ''].join(','));

    return rows.join('\n');
};

// ===========================================================================
// EXCEL — CORE
// ===========================================================================

/**
 * Appends one moodboard's data block into a worksheet.
 * Returns { total: number, nextRow: number }
 */
const appendMoodboardData = async (worksheet, moodboard, project, products = [], startRow) => {
    const activeProducts  = products.length > 0 ? products : (moodboard?.estimatedCostId?.products || []);
    const customPhotos    = (moodboard?.customPhotos || []).filter(p => !(p.tags || []).includes('Render'));
    const renders         = (moodboard?.customPhotos || []).filter(p => (p.tags || []).includes('Render'));
    const customRows      = moodboard?.customRows || [];
    const productStatuses = moodboard?.productMetadata || {};

    const allItems = [
        ...activeProducts.map(p  => ({ type: 'product', data: p })),
        ...customPhotos.map(p    => ({ type: 'photo',   data: p })),
        ...customRows.map(r      => ({ type: 'row',     data: r })),
    ];

    if (allItems.length === 0) return { total: 0, nextRow: startRow };

    let currentRow = startRow;
    const workbook  = worksheet.workbook;

    // ── Space header ──────────────────────────────────────────────────────
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    const spaceHeader = worksheet.getRow(currentRow);
    spaceHeader.getCell(1).value = `SPACE: ${(moodboard.moodboard_name || 'Materials').toUpperCase()}`;
    Object.assign(spaceHeader.getCell(1), STYLES.headerSpace);
    spaceHeader.height = 35;
    currentRow++;

    // ── Table headers ─────────────────────────────────────────────────────
    const HEADERS = ['Image', 'Name', 'Brand', 'Category', 'Spec Status', 'Unique Code', 'Qty', 'Unit Price', 'Total', 'Project'];
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = HEADERS;
    HEADERS.forEach((_, i) => Object.assign(headerRow.getCell(i + 1), STYLES.tableHeader));
    headerRow.height = 30;
    currentRow++;

    let spaceTotal = 0;

    for (let i = 0; i < allItems.length; i++) {
        const { type, data } = allItems[i];
        const isProduct = type === 'product';
        const isPhoto   = type === 'photo';
        const isRow     = type === 'row';

        const meta  = isProduct ? (productStatuses[data._id] || {}) : data;
        const st    = (isPhoto || isRow)
            ? (data.status || 'Considering')
            : (typeof meta === 'object' ? meta.status : meta || 'Considering');
        const qty   = Number((isPhoto || isRow) ? data.quantity : meta.quantity) || 1;

        let price = 0;
        if (isPhoto || isRow) {
            price = Number(data.price) || 0;
        } else if (typeof meta === 'object' && meta.price !== undefined) {
            price = Number(meta.price);
        } else {
            const { price: dp } = resolvePricing(data);
            price = dp;
        }

        const total = qty * price;
        spaceTotal += total;

        const row = worksheet.getRow(currentRow);
        // col 1 = Image (embedded later)
        row.getCell(2).value  = isProduct ? getProductName(data)  : (data.title || '');
        row.getCell(3).value  = isProduct ? getProductBrand(data) : (isPhoto ? 'Custom Upload' : 'Custom Row');
        row.getCell(4).value  = isProduct ? getProductCategory(data) : '';
        row.getCell(5).value  = st;
        row.getCell(6).value  = isProduct
            ? (data?.product_unique_id || (typeof data?.productId === 'object' ? data?.productId?.product_unique_id : '') || '')
            : '—';
        row.getCell(7).value  = qty;
        row.getCell(8).value  = price;
        row.getCell(9).value  = total;
        row.getCell(10).value = project?.projectName || 'ArcMat';

        [2, 3, 4, 5, 6, 7, 10].forEach(c => Object.assign(row.getCell(c), STYLES.cellStandard));
        [8, 9].forEach(c => {
            row.getCell(c).numFmt = '₹#,##0.00';
            Object.assign(row.getCell(c), STYLES.cellStandard);
        });

        // Alternating row background
        if (i % 2 !== 0) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ODD_ROW } };
        }

        row.height = isProduct || isPhoto ? 100 : 35;

        // Embed thumbnail
        const thumbUrl = isProduct ? getProductThumbnail(data) : (isPhoto ? (data.previewUrl || '') : null);
        if (thumbUrl && !thumbUrl.includes('arcmatlogo')) {
            const buf = await safeFetch(thumbUrl);
            if (buf) {
                try {
                    const ext = getExtFromUrl(thumbUrl, 'jpeg');
                    const imageId = workbook.addImage({ buffer: buf, extension: ext === 'jpg' ? 'jpeg' : ext });
                    worksheet.addImage(imageId, {
                        tl: { col: 0, row: currentRow - 1 },
                        ext: { width: 110, height: 110 },
                        editAs: 'oneCell',
                    });
                } catch {
                    row.getCell(1).value = '(img)';
                }
            } else {
                row.getCell(1).value = '(img)';
            }
        }

        currentRow++;
    }

    // ── Space total row ───────────────────────────────────────────────────
    const totalRow = worksheet.getRow(currentRow);
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    totalRow.getCell(1).value  = `${(moodboard.moodboard_name || '').toUpperCase()} — SUBTOTAL`;
    totalRow.getCell(9).value  = spaceTotal;
    totalRow.getCell(9).numFmt = '₹#,##0.00';
    for (let c = 1; c <= 10; c++) Object.assign(totalRow.getCell(c), STYLES.total);
    totalRow.height = 30;
    currentRow += 2;


    return { total: spaceTotal, nextRow: currentRow };
};

// ===========================================================================
// EXCEL BUILDERS
// ===========================================================================

/**
 * Build an Excel buffer for a single moodboard.
 * Returns null when there are no items to show.
 */
const buildMoodboardExcelBuffer = async (moodboard, project, products = []) => {
    const workbook  = new ExcelJS.Workbook();
    workbook.creator = 'ArcMat';
    workbook.created = new Date();

    const sheetName = (moodboard?.moodboard_name || 'Materials').substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
        { width: 20 }, { width: 35 }, { width: 22 }, { width: 22 },
        { width: 16 }, { width: 20 }, { width: 8 }, { width: 15 }, { width: 15 }, { width: 18 },
    ];

    const { total, nextRow } = await appendMoodboardData(worksheet, moodboard, project, products, 1);
    if (nextRow === 1) return null;

    return workbook.xlsx.writeBuffer();
};

/**
 * Build a multi-sheet project summary Excel.
 * Sheet 1 = "Project Overview" (summary table + metadata)
 * Sheet N = per-space detail tab
 */
const buildProjectSummaryExcel = async (project, moodboards) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ArcMat';
        workbook.created = new Date();

        const COL_WIDTHS = [
            { width: 20 }, { width: 35 }, { width: 22 }, { width: 22 },
            { width: 16 }, { width: 20 }, { width: 8 }, { width: 15 }, { width: 15 }, { width: 18 },
        ];

        // ── Main Report sheet ─────────────────────────────────────────────
        const ov = workbook.addWorksheet('Project Report');
        ov.columns = COL_WIDTHS;

        let cur = 2;

        // Title
        ov.mergeCells(`A${cur}:J${cur}`);
        const titleCell = ov.getRow(cur).getCell(1);
        titleCell.value = 'PROJECT SPECIFICATION REPORT — ARCMAT';
        Object.assign(titleCell, STYLES.headerMain);
        ov.getRow(cur).height = 50;
        cur += 2;

        // Metadata block
        const meta = [
            ['Project Name', project?.projectName || 'N/A'],
            ['Client',       project?.clientName  || 'N/A'],
            ['Phase',        project?.phase       || 'N/A'],
            ['Status',       project?.status      || 'Active'],
            ['Total Spaces', moodboards.filter(Boolean).length],
            ['Exported On',  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
        ];
        for (const [label, value] of meta) {
            ov.getCell(`B${cur}`).value = label;
            ov.getCell(`B${cur}`).font  = { bold: true, color: { argb: COLORS.SECONDARY } };
            ov.getCell(`C${cur}`).value = value;
            ov.getCell(`C${cur}`).font  = { bold: true, color: { argb: COLORS.PRIMARY } };
            cur++;
        }
        cur += 2;

        // Summary by space header
        ov.mergeCells(`B${cur}:H${cur}`); // Corrected merge to match 7 columns
        const sbsCell = ov.getRow(cur).getCell(2);
        sbsCell.value = 'SUMMARY BY SPACE';
        sbsCell.font  = { bold: true, color: { argb: COLORS.WHITE } };
        sbsCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ACCENT } };
        sbsCell.alignment = { horizontal: 'center' };
        ov.getRow(cur).height = 30;
        cur++;

        // Summary column headers
        const sbsRow = ov.getRow(cur);
        ['#', 'Space Name', 'Items', 'Products', 'Custom Photos', 'Renders', 'Cost (₹)'].forEach((h, i) => {
            const c = sbsRow.getCell(i + 2);
            c.value = h;
            c.font  = { bold: true };
            c.alignment = { horizontal: 'center' };
            c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT_BG } };
        });
        cur++;

        let grandTotal  = 0;
        const summaryStart = cur;

        // ── Per-space data collection & individual sheets ─────────────────
        for (let i = 0; i < moodboards.length; i++) {
            const mb = moodboards[i];
            if (!mb) continue;

            // Create individual sheet
            const sheet = workbook.addWorksheet((mb.moodboard_name || `Space ${i + 1}`).substring(0, 31));
            sheet.columns = COL_WIDTHS;
            const { total } = await appendMoodboardData(sheet, mb, project, [], 1);
            grandTotal += total;

            const productCount = (mb.estimatedCostId?.products || []).length;
            const photoCount   = (mb.customPhotos || []).filter(p => !(p.tags || []).includes('Render')).length;
            const renderCount  = (mb.customPhotos || []).filter(p => (p.tags || []).includes('Render')).length;
            const totalItems   = productCount + photoCount + (mb.customRows || []).length;

            const row = ov.getRow(cur);
            [i + 1, mb.moodboard_name, totalItems, productCount, photoCount, renderCount, total].forEach((v, j) => {
                const cell = row.getCell(j + 2);
                cell.value = v;
                cell.alignment = { horizontal: 'center' };
                if (j === 6) cell.numFmt = '₹#,##0.00';
            });
            // Alternating rows
            if (i % 2 !== 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ODD_ROW } };
            }
            cur++;
        }

        // Summary Grand Total
        cur++;
        const gtRow = ov.getRow(cur);
        ov.mergeCells(`B${cur}:G${cur}`);
        gtRow.getCell(2).value = 'TOTAL ESTIMATED PROJECT VALUE';
        gtRow.getCell(2).font  = { bold: true, size: 12, color: { argb: COLORS.PRIMARY } };
        gtRow.getCell(2).alignment = { horizontal: 'right' };
        gtRow.getCell(8).value = grandTotal;
        gtRow.getCell(8).font  = { bold: true, size: 13, color: { argb: COLORS.PRIMARY } };
        gtRow.getCell(8).numFmt = '₹#,##0.00';
        gtRow.height = 35;
        cur += 4;

        // ── CONSOLIDATED DETAILED SPECIFICATIONS ──────────────────────────
        ov.mergeCells(`A${cur}:J${cur}`);
        const detailHeader = ov.getRow(cur).getCell(1);
        detailHeader.value = 'DETAILED MATERIAL SPECIFICATIONS';
        detailHeader.font = { bold: true, size: 14, color: { argb: COLORS.WHITE } };
        detailHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
        detailHeader.alignment = { horizontal: 'center' };
        ov.getRow(cur).height = 40;
        cur += 2;

        for (let i = 0; i < moodboards.length; i++) {
            const mb = moodboards[i];
            if (!mb) continue;

            const { nextRow } = await appendMoodboardData(ov, mb, project, [], cur);
            cur = nextRow + 1;
        }

        // Final Grand Total at the bottom of the main report
        cur += 2;
        ov.mergeCells(`A${cur}:H${cur}`);
        const finalGtRow = ov.getRow(cur);
        finalGtRow.getCell(1).value = 'GRAND PROJECT TOTAL';
        finalGtRow.getCell(9).value = grandTotal;
        finalGtRow.getCell(9).numFmt = '₹#,##0.00';
        for (let c = 1; c <= 10; c++) {
            Object.assign(finalGtRow.getCell(c), STYLES.total);
            finalGtRow.getCell(c).font = { bold: true, size: 14, color: { argb: COLORS.PRIMARY } };
        }
        finalGtRow.height = 45;

        return workbook.xlsx.writeBuffer();
    } catch (err) {
        console.error('[ArcMat] Project summary Excel failed:', err);
        return null;
    }
};


// ===========================================================================
// ZIP BUILDER — PER SPACE
// ===========================================================================

/**
 * Populate a JSZip folder with all assets for one moodboard:
 *  readme.txt, <space>-report.xlsx, <space>-materials.csv,
 *  products/, renders/, photos/, cover.*
 *
 * Returns the space's calculated total cost.
 */
const addSpaceToZip = async (zipFolder, moodboard, project, toastId, canvasSnapshot = null) => {
    const spaceName     = sanitize(moodboard?.moodboard_name, 'space');
    const activeProducts = moodboard?.estimatedCostId?.products || [];
    const photos         = (moodboard?.customPhotos || []).filter(p => !(p.tags || []).includes('Render'));
    const renders        = (moodboard?.customPhotos || []).filter(p => (p.tags || []).includes('Render'));
    const productStatuses = moodboard?.productMetadata || {};

    // ── 1. Excel report ───────────────────────────────────────────────────
    console.log(`[ArcMat Export] 📊 Building Excel for "${spaceName}"…`);
    const excelBuffer = await buildMoodboardExcelBuffer(moodboard, project);
    if (excelBuffer) {
        console.log(`[ArcMat Export] ✅ Excel built successfully (${excelBuffer.byteLength} bytes)`);
        zipFolder.folder('reports').file(`${spaceName}-report.xlsx`, excelBuffer);
    } else {
        console.warn(`[ArcMat Export] ⚠️ Excel build returned null for "${spaceName}"`);
    }

    // ── 2. CSV report ─────────────────────────────────────────────────────
    toast.loading(`📄 Building CSV for "${spaceName}"…`, { id: toastId });
    const csvContent = buildSpaceCSV(moodboard, project);
    zipFolder.folder('reports').file(`${spaceName}-materials.csv`, csvContent);

    // ── 3. Product images folder ──────────────────────────────────────────
    // DISCOVERY: include products from spec sheet AND canvas state
    const canvasMaterials = (moodboard?.canvasState || [])
        .filter(item => item.type === 'material' && item.material)
        .map(item => item.material);
    
    // De-duplicate by _id
    const seenIds = new Set();
    const allUniqueProducts = [];
    [...activeProducts, ...canvasMaterials].forEach(p => {
        if (!p?._id || seenIds.has(p._id)) return;
        seenIds.add(p._id);
        allUniqueProducts.push(p);
    });

    if (allUniqueProducts.length > 0) {
        console.log(`[ArcMat Export] 🖼 Fetching ${allUniqueProducts.length} product image(s)…`);
        const productsFolder = zipFolder.folder('products');
        await Promise.all(
            allUniqueProducts.map(async (p, idx) => {
                const thumbUrl = getProductThumbnail(p);
                if (!thumbUrl || thumbUrl.includes('arcmatlogo')) return;
                const buf = await safeFetch(thumbUrl);
                if (buf) {
                    const ext  = getExtFromUrl(thumbUrl);
                    const name = sanitize(getProductName(p) || `product-${idx + 1}`);
                    productsFolder.file(`${String(idx + 1).padStart(2, '0')}-${name}.${ext}`, buf);
                } else {
                    console.warn(`[addSpaceToZip] Failed to fetch product image: ${thumbUrl}`);
                }
            })
        );
    }

    // ── 4. Renders folder ─────────────────────────────────────────────────
    if (renders.length > 0) {
        console.log(`[ArcMat Export] 🎨 Fetching ${renders.length} render(s)…`);
        const rendersFolder = zipFolder.folder('renders');
        await Promise.all(
            renders.map(async (r, idx) => {
                const buf = await safeFetch(r.previewUrl);
                if (buf) {
                    const ext  = getExtFromUrl(r.previewUrl);
                    const name = sanitize(r.title || `render-${idx + 1}`);
                    rendersFolder.file(`${String(idx + 1).padStart(2, '0')}-${name}.${ext}`, buf);
                }
            })
        );
    }

    // ── 5. Custom photos folder ───────────────────────────────────────────
    if (photos.length > 0) {
        console.log(`[ArcMat Export] 📷 Fetching ${photos.length} photo(s)…`);
        const photosFolder = zipFolder.folder('photos');
        await Promise.all(
            photos.map(async (ph, idx) => {
                const buf = await safeFetch(ph.previewUrl);
                if (buf) {
                    const ext  = getExtFromUrl(ph.previewUrl);
                    const name = sanitize(ph.title || `photo-${idx + 1}`);
                    photosFolder.file(`${String(idx + 1).padStart(2, '0')}-${name}.${ext}`, buf);
                }
            })
        );
    }

    // ── 6. Canvas / Cover image (Gauranteed folder inclusion) ─────────────
    const canvasFolder = zipFolder.folder('canvas');
    
    // Resolve best possible cover URL
    let coverUrl = canvasSnapshot || getImageUrl(moodboard?.coverImage);
    
    // FALLBACK: If no cover/snapshot, try to derive from the first material in the design
    if (!coverUrl && allUniqueProducts.length > 0) {
        coverUrl = getProductThumbnail(allUniqueProducts[0]);
        console.log(`[addSpaceToZip] Falling back to derived material thumbnail for "${spaceName}"`);
    }

    // FINAL FALLBACK: Brand Logo
    if (!coverUrl) {
        coverUrl = '/Icons/arcmatlogo.svg';
        console.log(`[addSpaceToZip] Using final brand placeholder for "${spaceName}"`);
    }

    if (coverUrl) {
        // Ensure relative URLs are handled even outside safeFetch for clarity
        let finalCoverUrl = coverUrl;
        if (coverUrl.startsWith('/') && !coverUrl.startsWith('//')) {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '').replace('/api', '');
            finalCoverUrl = `${apiUrl}${coverUrl}`;
        }

        const buf = await safeFetch(finalCoverUrl);
        if (buf) {
            const ext = getExtFromUrl(finalCoverUrl, 'jpg');
            canvasFolder.file(`cover.${ext}`, buf);
            canvasFolder.file(`design-canvas.${ext}`, buf);
            console.log(`[addSpaceToZip] ✅ Canvas/Cover added to "${spaceName}"`);
        } else {
            canvasFolder.file('README_CANVAS.txt', 'Design preview could not be fetched.');
            console.warn(`[addSpaceToZip] ❌ Failed to fetch cover image from: ${finalCoverUrl}`);
        }
    } else {
        canvasFolder.file('README_CANVAS.txt', 'No design preview available.');
        console.warn(`[addSpaceToZip] ⚠️ No cover source found for "${spaceName}"`);
    }

    // ── 7. README ─────────────────────────────────────────────────────────
    let spaceTotal = 0;
    for (const p of activeProducts) {
        const meta  = productStatuses[p._id] || {};
        const qty   = Number(meta.quantity) || 1;
        const price = typeof meta === 'object' && meta.price !== undefined
            ? Number(meta.price)
            : resolvePricing(p).price;
        spaceTotal += qty * price;
    }
    for (const ph of [...photos, ...renders]) {
        spaceTotal += (Number(ph.quantity) || 1) * (Number(ph.price) || 0);
    }
    for (const r of moodboard?.customRows || []) {
        spaceTotal += (Number(r.quantity) || 1) * (Number(r.price) || 0);
    }

    const stats = {
        hasProducts:  activeProducts.length > 0,
        hasRenders:   renders.length > 0,
        hasPhotos:    photos.length > 0,
        hasCover:     Boolean(coverUrl),
        productCount: activeProducts.length,
        renderCount:  renders.length,
        photoCount:   photos.length,
        total:        spaceTotal,
    };

    zipFolder.file('README.txt', buildSpaceReadme(moodboard, project, stats));

    return spaceTotal;
};

// ===========================================================================
// PUBLIC API
// ===========================================================================

/**
 * Export a single moodboard as a folder-wise ZIP.
 *
 * ZIP structure:
 *   <SpaceName>/
 *     README.txt
 *     <space>-report.xlsx
 *     <space>-materials.csv
 *     products/          ← one image per product
 *     renders/           ← visual renders
 *     photos/            ← custom uploads
 *     cover.<ext>        ← space cover image (if set)
 */
export const exportMoodboardToZip = async (moodboard, project, products = [], canvasSnapshot = null) => {
    const toastId   = 'mb-zip-export';
    const spaceName = sanitize(moodboard?.moodboard_name, 'space');

    toast.loading(`🚀 Preparing "${spaceName}" export…`, { id: toastId });

    try {
        const zip         = new JSZip();
        const spaceFolder = zip.folder(spaceName);

        await addSpaceToZip(spaceFolder, moodboard, project, toastId, canvasSnapshot);

        toast.loading('📦 Compressing ZIP…', { id: toastId });
        console.log(`[ArcMat Export] 📦 Generating ZIP blob…`);
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
        });

        console.log(`[ArcMat Export] 🚀 Exporting "${spaceName}" ZIP (${zipBlob.size} bytes)`);
        triggerDownload(zipBlob, `${spaceName}-export.zip`, 'application/zip');
        toast.success(`✅ "${moodboard?.moodboard_name}" exported!`, { id: toastId });
    } catch (err) {
        console.error('[ArcMat Export] CRITICAL: Moodboard ZIP export failed:', err);
        toast.error('Failed to export space — please check console for details', { id: toastId });
        throw err; // Re-throw so toast.promise in the UI can catch it
    }
};

/**
 * Export a full project as a folder-wise ZIP.
 *
 * ZIP structure:
 *   <ProjectName>/
 *     README.txt
 *     <project>-summary.xlsx    ← multi-sheet overview
 *     <SpaceName1>/
 *       README.txt
 *       <space>-report.xlsx
 *       <space>-materials.csv
 *       products/
 *       renders/
 *       photos/
 *       cover.<ext>
 *     <SpaceName2>/
 *       …
 */
export const exportProjectToZip = async (project, moodboards = []) => {
    const toastId = 'project-zip-export';

    if (!moodboards || moodboards.length === 0) {
        toast.error('No spaces found in this project to export');
        return;
    }

    toast.loading('🚀 Starting project export…', { id: toastId });

    try {
        const projectName   = sanitize(project?.projectName, 'project');
        const zip           = new JSZip();
        const projectFolder = zip.folder(projectName);

        let grandTotal = 0;

        // ── Per-space sub-folders ─────────────────────────────────────────
        for (let i = 0; i < moodboards.length; i++) {
            const mb = moodboards[i];
            if (!mb) continue;
            const spaceName   = sanitize(mb?.moodboard_name, 'space');
            const spaceFolder = projectFolder.folder(spaceName);
            toast.loading(`⏳ Processing space ${i + 1}/${moodboards.length}: "${spaceName}"…`, { id: toastId });
            const spaceTotal = await addSpaceToZip(spaceFolder, mb, project, toastId);
            grandTotal += spaceTotal;
        }

        // ── Project cover image ───────────────────────────────────────────
        const projectCoverUrl = getImageUrl(project?.coverImage);
        if (projectCoverUrl) {
            const buf = await safeFetch(projectCoverUrl);
            if (buf) {
                const ext = getExtFromUrl(projectCoverUrl, 'jpg');
                projectFolder.folder('canvas').file(`cover.${ext}`, buf);
            }
        }

        // ── Project summary Excel (multi-sheet) ───────────────────────────
        toast.loading('📊 Building project summary…', { id: toastId });
        const summaryBuffer = await buildProjectSummaryExcel(project, moodboards);
        if (summaryBuffer) {
            projectFolder.folder('reports').file(`${projectName}-summary.xlsx`, summaryBuffer);
        }

        // ── Project README ────────────────────────────────────────────────
        projectFolder.file('README.txt', buildProjectReadme(project, moodboards, grandTotal));

        // ── Generate ZIP ──────────────────────────────────────────────────
        toast.loading('📦 Compressing project ZIP…', { id: toastId });
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
        });

        triggerDownload(zipBlob, `${projectName}-export.zip`, 'application/zip');
        toast.success('✅ Project exported successfully!', { id: toastId });
    } catch (err) {
        console.error('[ArcMat] Project ZIP export failed:', err);
        toast.error('Failed to create project ZIP — please try again', { id: toastId });
    }
};

// ===========================================================================
// STANDALONE CSV EXPORT (for direct download without ZIP)
// ===========================================================================

/**
 * Download a single moodboard's material list as a standalone CSV file.
 */
export const exportMoodboardToCSV = async (moodboard, project) => {
    const toastId = 'csv-export';
    toast.loading('Building CSV…', { id: toastId });

    try {
        const csv      = buildSpaceCSV(moodboard, project);
        const spaceName = sanitize(moodboard?.moodboard_name, 'space');
        const blob     = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
        triggerDownload(blob, `${spaceName}-materials.csv`, 'text/csv');
        toast.success('CSV downloaded!', { id: toastId });
    } catch (err) {
        console.error('[ArcMat] CSV export failed:', err);
        toast.error('Failed to export CSV', { id: toastId });
    }
};

/**
 * Download a consolidated material list for the entire project as a standalone CSV.
 */
export const exportProjectToCSV = async (project, moodboards = []) => {
    const toastId = 'project-csv-export';
    toast.loading('Building project CSV…', { id: toastId });

    try {
        const projectName = sanitize(project?.projectName, 'project');
        let consolidatedCsv = '';

        for (const mb of moodboards) {
            if (!mb) continue;
            const spaceCsv = buildSpaceCSV(mb, project);
            consolidatedCsv += `\n--- SPACE: ${mb.moodboard_name || 'Untitled'} ---\n` + spaceCsv + '\n';
        }

        const blob = new Blob(['\uFEFF' + consolidatedCsv], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, `${projectName}-materials-list.csv`, 'text/csv');
        toast.success('Project CSV downloaded!', { id: toastId });
    } catch (err) {
        console.error('[ArcMat] Project CSV export failed:', err);
        toast.error('Failed to export project CSV', { id: toastId });
    }
};

// ===========================================================================
// LEGACY COMPAT — kept for existing callers
// ===========================================================================

/**
 * Download a single moodboard's material list as a standalone Excel (.xlsx) file.
 */
export const exportMoodboardToExcel = async (moodboard, project, products = []) => {
    toast.loading('Preparing excel export...', { id: 'export-toast' });
    try {
        const buffer = await buildMoodboardExcelBuffer(moodboard, project, products);
        if (!buffer) {
            toast.error('No materials found to export', { id: 'export-toast' });
            return;
        }
        const spaceName = sanitize(moodboard?.moodboard_name, 'space');
        triggerDownload(
            buffer,
            `${spaceName}-export.xlsx`,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        toast.success('Excel exported!', { id: 'export-toast' });
    } catch (err) {
        console.error('[ArcMat] Excel export failed:', err);
        toast.error('Failed to export Excel', { id: 'export-toast' });
    }
};

/**
 * Download a consolidated project material list as a standalone Excel (.xlsx) file.
 */
export const exportProjectToExcel = async (project, moodboards = [], options = {}) => {
    const { returnBuffer = false } = options;
    if (!moodboards?.length) {
        if (!returnBuffer) toast.error('No spaces found in this project to export');
        return null;
    }
    if (!returnBuffer) toast.loading('Preparing project Excel…', { id: 'export-toast' });
    try {
        const buffer = await buildProjectSummaryExcel(project, moodboards);
        if (returnBuffer) return buffer;
        if (!buffer) {
            toast.error('Failed to generate project report', { id: 'export-toast' });
            return null;
        }
        const projectName = sanitize(project?.projectName, 'project');
        triggerDownload(
            buffer,
            `${projectName}-specification-report.xlsx`,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        toast.success('Project report generated!', { id: 'export-toast' });
        return buffer;
    } catch (err) {
        console.error('[ArcMat] Project Excel export failed:', err);
        if (!returnBuffer) toast.error('Failed to generate project report', { id: 'export-toast' });
        return null;
    }
};

// ===========================================================================
// IMAGE DOWNLOAD HELPER
// ===========================================================================

export const downloadImage = async (url, filename) => {
    if (!url) return;
    const toastId = toast.loading('Preparing download…');
    try {
        const buf = await safeFetch(url);
        if (!buf) throw new Error('Fetch returned null');
        const ext  = getExtFromUrl(url, 'jpg');
        triggerDownload(buf, filename || `arcmat-image.${ext}`);
        toast.success('Download started', { id: toastId });
    } catch (err) {
        console.error('[ArcMat] Image download failed:', err);
        toast.error('Failed to download image', { id: toastId });
    }
};
