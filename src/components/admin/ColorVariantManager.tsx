"use client";
import { useRef } from "react";
import Image from "next/image";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ColorVariant {
  color: string;
  colorHex: string;
  images: string[];        // front images
  backImage?: string;      // optional back image
  isDefault?: boolean;
  uploading?: boolean;
  uploadingBack?: boolean;
}

interface Props {
  variants: ColorVariant[];
  onChange: (variants: ColorVariant[]) => void;
}

export default function ColorVariantManager({ variants, onChange }: Props) {
  const frontRefs = useRef<(HTMLInputElement | null)[]>([]);
  const backRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addVariant = () => {
    const isFirst = variants.length === 0;
    onChange([...variants, { color: "", colorHex: "#000000", images: [], isDefault: isFirst }]);
  };

  const removeVariant = (idx: number) => {
    const next = variants.filter((_, i) => i !== idx);
    // If we removed the default and there are still variants, make first one default
    if (variants[idx].isDefault && next.length > 0) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  const updateVariant = (idx: number, patch: Partial<ColorVariant>) => {
    onChange(variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const setDefault = (idx: number) => {
    onChange(variants.map((v, i) => ({ ...v, isDefault: i === idx })));
  };

  const uploadFrontImages = async (idx: number, files: FileList) => {
    updateVariant(idx, { uploading: true });
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await res.json();
        if (result.url) {
          uploaded.push(result.url);
        } else {
          toast.error(`Upload failed: ${result.error || "unknown error"}`);
        }
      } catch {
        toast.error("Upload failed");
      }
    }
    const current = variants[idx];
    updateVariant(idx, { images: [...current.images, ...uploaded], uploading: false });
  };

  const uploadBackImage = async (idx: number, file: File) => {
    updateVariant(idx, { uploadingBack: true });
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const result = await res.json();
      if (result.url) {
        updateVariant(idx, { backImage: result.url, uploadingBack: false });
      } else {
        toast.error(`Upload failed: ${result.error || "unknown error"}`);
        updateVariant(idx, { uploadingBack: false });
      }
    } catch {
      toast.error("Upload failed");
      updateVariant(idx, { uploadingBack: false });
    }
  };

  const removeFrontImage = (variantIdx: number, imgIdx: number) => {
    const images = variants[variantIdx].images.filter((_, i) => i !== imgIdx);
    updateVariant(variantIdx, { images });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs tracking-[0.1em] uppercase font-body font-medium">
          Color Variants
        </label>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border text-xs font-body hover:bg-secondary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Color Variant
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs font-body text-muted-foreground">
          No color variants yet. Click &quot;Add Color Variant&quot; to add one.
        </p>
      )}

      <div className="space-y-4">
        {variants.map((variant, idx) => (
          <div
            key={idx}
            className={`border p-4 space-y-4 ${variant.isDefault ? "border-primary" : "border-border"}`}
          >
            {/* Header: Default badge + remove */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {variant.isDefault ? (
                  <span className="text-[10px] uppercase tracking-widest font-body px-2 py-0.5 bg-primary text-primary-foreground">
                    Default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDefault(idx)}
                    className="text-[10px] uppercase tracking-widest font-body px-2 py-0.5 border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="p-1 hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Color name + hex picker */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Color name (e.g. Navy)"
                value={variant.color}
                onChange={(e) => updateVariant(idx, { color: e.target.value })}
                className="flex-1 min-w-[120px] bg-secondary/30 border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-primary"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs font-body text-muted-foreground whitespace-nowrap">Hex</label>
                <input
                  type="color"
                  value={variant.colorHex}
                  onChange={(e) => updateVariant(idx, { colorHex: e.target.value })}
                  className="w-10 h-9 border border-border cursor-pointer p-0.5 bg-secondary/30"
                />
              </div>
            </div>

            {/* Front Images */}
            <div className="space-y-2">
              <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                Front Images <span className="text-destructive">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variant.images.map((url, imgIdx) => (
                  <div key={imgIdx} className="relative w-20 h-24 group">
                    <Image
                      src={url}
                      alt={`${variant.color} front ${imgIdx + 1}`}
                      fill
                      className="object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFrontImage(idx, imgIdx)}
                      className="absolute top-1 right-1 p-0.5 bg-background/80 hover:bg-background text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Front upload zone */}
                <div className="relative w-20 h-24 border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center cursor-pointer">
                  <input
                    ref={(el) => { frontRefs.current[idx] = el; }}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && uploadFrontImages(idx, e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={variant.uploading}
                  />
                  {variant.uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Back Image (optional) */}
            <div className="space-y-2">
              <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                Back Image <span className="text-muted-foreground font-normal">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variant.backImage && (
                  <div className="relative w-20 h-24 group">
                    <Image
                      src={variant.backImage}
                      alt={`${variant.color} back`}
                      fill
                      className="object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => updateVariant(idx, { backImage: "" })}
                      className="absolute top-1 right-1 p-0.5 bg-background/80 hover:bg-background text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {!variant.backImage && (
                  <div className="relative w-20 h-24 border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
                    <input
                      ref={(el) => { backRefs.current[idx] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && uploadBackImage(idx, e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={variant.uploadingBack}
                    />
                    {variant.uploadingBack ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[9px] font-body text-muted-foreground">Back</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
