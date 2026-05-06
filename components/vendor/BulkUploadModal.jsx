'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from '@/components/ui/Toast';
import {
  X, Upload, FileText, CheckCircle, AlertCircle,
  Package, Layers, Download, ImageIcon, RefreshCw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';
import * as XLSX from 'xlsx';
import { productService } from '@/services/productService';

// ─── Tiny UUID generator (no dependency needed) ──────────────────────────────
const generateSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default function BulkUploadModal() {
  const { isBulkUploadModalOpen, closeBulkUploadModal } = useUIStore();
  const { user } = useAuth();

  // ── Stepper state ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ── File state ─────────────────────────────────────────────────────────────
  const [zipFile, setZipFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const csvInputRef = useRef(null); // so we can reset the <input> imperatively

  // ── Upload / result state ──────────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState(null); // null = no result yet

  // ── Session tracking (for retry cleanup) ───────────────────────────────────
  // A new session ID is minted when the step starts; reused on every retry of
  // that step so we know exactly which DB records belong to this attempt.
  const [productSessionId, setProductSessionId] = useState(() => generateSessionId());
  const [variantSessionId, setVariantSessionId] = useState(() => generateSessionId());

  // ─────────────────────────────────────────────────────────────────────────
  // FILE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleZipFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.endsWith('.zip')) {
      toast.error('Please upload a valid ZIP file');
      return;
    }
    setZipFile(f);
  };

  const handleCsvFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const valid = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!valid.includes(f.type) && !f.name.endsWith('.csv') && !f.name.endsWith('.xlsx')) {
      toast.error('Please upload a valid CSV or Excel file');
      return;
    }
    setCsvFile(f);
    setResult(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — IMAGE UPLOAD (unchanged, no retry needed)
  // ─────────────────────────────────────────────────────────────────────────
  const handleZipUpload = async () => {
    if (!zipFile) return;
    setIsUploading(true);
    try {
      const response = await productService.bulkImageUpload(zipFile);
      toast.success(`Successfully uploaded ${response.data.uploadedCount} images`);
      setCurrentStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — PRODUCT UPLOAD
  // ─────────────────────────────────────────────────────────────────────────
  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setIsUploading(true);
    try {
      const response = await productService.bulkImport(
        csvFile,
        'product',
        null,
        productSessionId
      );
      setResult(response.data);
      toast.success('Products imported successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload products');
      // Still show result panel if the backend returned partial details
      if (err.response?.data?.data) setResult(err.response.data.data);
    } finally {
      setIsUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3 — VARIANT UPLOAD
  // ─────────────────────────────────────────────────────────────────────────
  const handleVariantUpload = async () => {
    if (!csvFile) return;
    setIsUploading(true);
    try {
      const response = await productService.bulkImport(
        csvFile,
        'variant',
        null,
        variantSessionId
      );
      setResult(response.data);
      toast.success('Variants imported successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload variants');
      if (err.response?.data?.data) setResult(err.response.data.data);
    } finally {
      setIsUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RETRY — clear previous session records, then reset UI for fresh upload
  // ─────────────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(async () => {
    const step = currentStep === 2 ? 'product' : 'variant';
    const sessionId = currentStep === 2 ? productSessionId : variantSessionId;

    setIsClearing(true);
    try {
      await productService.bulkClearSession(sessionId, step);
      toast.success('Previous import data cleared. Upload a fresh file.');
    } catch (err) {
      // Non-fatal — warn but still let the user retry
      console.warn('clearBulkSession failed (non-fatal):', err);
      toast.error('Could not fully clear previous data. Proceeding anyway.');
    } finally {
      setIsClearing(false);
    }

    // Mint a fresh session ID for the retry attempt
    if (currentStep === 2) setProductSessionId(generateSessionId());
    else setVariantSessionId(generateSessionId());

    // Reset file + results so the user sees a clean upload panel
    setCsvFile(null);
    setResult(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
  }, [currentStep, productSessionId, variantSessionId]);

  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION & CLOSE
  // ─────────────────────────────────────────────────────────────────────────
  const handleGoToVariants = () => {
    setCsvFile(null);
    setResult(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
    setCurrentStep(3);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setZipFile(null);
    setCsvFile(null);
    setResult(null);
    setProductSessionId(generateSessionId());
    setVariantSessionId(generateSessionId());
    closeBulkUploadModal();
  };

  const handleDownloadSkipReport = () => {
    if (!result?.details?.skipped?.length) {
      toast.error('No skip report available');
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(result.details.skipped);
    XLSX.utils.book_append_sheet(wb, ws, 'Skip Report');
    XLSX.writeFile(wb, `Skip_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Skip report downloaded');
  };

  if (!isBulkUploadModalOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // SHARED: file drop zone (reused for Steps 2 and 3)
  // ─────────────────────────────────────────────────────────────────────────
  const CsvDropZone = () => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:bg-gray-100/50 transition-all cursor-pointer relative group">
      <input
        ref={csvInputRef}
        type="file"
        onChange={handleCsvFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        accept=".csv, .xlsx, .xls"
      />
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        {csvFile ? (
          <div className="flex flex-col items-center">
            <span className="text-md font-bold text-gray-900 truncate max-w-[250px]">{csvFile.name}</span>
            <span className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-3 py-1 rounded-full">File Ready</span>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-gray-900">Drop your file here or click to browse</p>
            <p className="text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Excel or CSV formats supported</p>
          </>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RESULT PANEL — shown after a products or variants upload completes
  // ─────────────────────────────────────────────────────────────────────────
  const ResultPanel = () => {
    const isStep2 = currentStep === 2;
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete</h3>
        <p className="text-sm text-gray-600 mb-6 px-4">{result.message}</p>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sync Summary</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Successfully Added</span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">{result.details.success} items</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Failed / Skipped</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">{result.details.failed} rows</span>
            </div>
          </div>

          {/* Error logs */}
          {result.details.errors?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-bold text-red-500 mb-2">Error Logs:</p>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {result.details.errors.map((err, idx) => (
                  <p key={idx} className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded flex items-start gap-2">
                    <span className="shrink-0">•</span>{err}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Skip report */}
          {result.details.skipped?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-orange-600">Skip Report ({result.details.skipped.length} items)</p>
                <button
                  onClick={handleDownloadSkipReport}
                  className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-colors"
                >
                  <Download className="w-3 h-3" />Download
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                {result.details.skipped.slice(0, 5).map((skip, idx) => (
                  <div key={idx} className="text-[11px] bg-orange-50 p-2 rounded border border-orange-100">
                    <p className="font-bold text-orange-900">
                      {isStep2
                        ? `${skip.productName || 'Unknown'} (SKU: ${skip.sku || 'N/A'})`
                        : `Variant SKU: ${skip.variantSKU || 'N/A'} (Base: ${skip.baseSKU || 'N/A'})`}
                    </p>
                    <p className="text-orange-700 mt-0.5">Reason: {skip.reason}</p>
                  </div>
                ))}
                {result.details.skipped.length > 5 && (
                  <p className="text-[10px] text-gray-500 text-center pt-1">
                    +{result.details.skipped.length - 5} more (download full report)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-col gap-3">
          {/* Retry row */}
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              disabled={isClearing}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-50 text-primary border border-primary py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-60"
            >
              {isClearing ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Clearing...</>
              ) : (
                <><RefreshCw className="w-4 h-4" />Retry Upload</>
              )}
            </Button>
          </div>

          {/* Navigation row */}
          {isStep2 ? (
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
              >
                Skip &amp; Finish
              </Button>
              <Button
                onClick={handleGoToVariants}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-[#d08963]"
              >
                Continue to Variants →
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleClose}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-[#d08963]"
            >
              Close &amp; View Updates
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Import Hub</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Step-by-step upload process</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-center gap-2">
            {[
              { num: 1, label: 'Images', icon: ImageIcon },
              { num: 2, label: 'Products', icon: Package },
              { num: 3, label: 'Variants', icon: Layers },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    currentStep === step.num ? 'bg-primary text-white shadow-md' :
                      currentStep > step.num ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-500'
                  )}>
                    {currentStep > step.num ? <CheckCircle className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={clsx('text-sm font-semibold', currentStep >= step.num ? 'text-gray-900' : 'text-gray-400')}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={clsx('w-12 h-0.5 mx-3', currentStep > step.num ? 'bg-green-500' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* After an import completes → show Result Panel */}
          {result ? (
            <ResultPanel />
          ) : (
            <>
              {/* ── STEP 1: Images ── */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-gray-900">Step 1: Upload Product Images (ZIP)</h3>
                  </div>

                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:bg-gray-100/50 transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      onChange={handleZipFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept=".zip"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
                        <FileText className="w-7 h-7 text-primary" />
                      </div>
                      {zipFile ? (
                        <div className="flex flex-col items-center">
                          <span className="text-md font-bold text-gray-900 truncate max-w-[250px]">{zipFile.name}</span>
                          <span className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-3 py-1 rounded-full">File Ready</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-gray-900">Drop your ZIP file here or click to browse</p>
                          <p className="text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-widest">ZIP format only</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-orange-900 mb-1">Important</p>
                        <ul className="space-y-1 text-orange-800/80 text-[13px] font-medium">
                          <li>• ZIP file should contain all product/variant images</li>
                          <li>• Supported formats: JPG, PNG, GIF, WEBP</li>
                          <li>• All existing brand images will be replaced</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleZipUpload}
                    disabled={!zipFile || isUploading}
                    className="w-full bg-primary text-white py-3.5 rounded-lg font-bold hover:bg-[#d08963] disabled:opacity-50 shadow-lg shadow-orange-100"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading Images...
                      </div>
                    ) : 'Upload Images & Continue'}
                  </Button>
                </div>
              )}

              {/* ── STEP 2: Products ── */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-gray-900">Step 2: Upload Products (CSV/Excel)</h3>
                  </div>

                  <CsvDropZone />

                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-orange-900 mb-1">Product Import Guidelines</p>
                        <ul className="space-y-1 text-orange-800/80 text-[13px] font-medium">
                          <li>• All three category levels (L1, L2, L3) are required</li>
                          <li>• Brand ID or Brand Name is required</li>
                          <li>• Unique Code and Product URL are mandatory</li>
                          <li>• Image names in CSV should match uploaded ZIP files from Step 1</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCsvUpload}
                    disabled={!csvFile || isUploading}
                    className="w-full bg-primary text-white py-3.5 rounded-lg font-bold hover:bg-[#d08963] disabled:opacity-50 shadow-lg shadow-orange-100"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing File...
                      </div>
                    ) : 'Import Products & Continue'}
                  </Button>
                </div>
              )}

              {/* ── STEP 3: Variants ── */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-gray-900">Step 3: Upload Variants (Optional)</h3>
                  </div>

                  <CsvDropZone />

                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-orange-900 mb-1">Variant Import Guidelines</p>
                        <ul className="space-y-1 text-orange-800/80 text-[13px] font-medium">
                          <li>• Unique Code is required to map variants to their product</li>
                          <li>• Variant SKU Code must be unique</li>
                          <li>• Attributes format: "Size: XL | Color: Red"</li>
                          <li>• Variants will be linked automatically via Unique Code</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleClose}
                      className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-lg font-bold hover:bg-gray-300"
                    >
                      Skip &amp; Finish
                    </Button>
                    <Button
                      onClick={handleVariantUpload}
                      disabled={!csvFile || isUploading}
                      className="flex-1 bg-primary text-white py-3.5 rounded-lg font-bold hover:bg-[#d08963] disabled:opacity-50 shadow-lg shadow-orange-100"
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : 'Import Variants'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}