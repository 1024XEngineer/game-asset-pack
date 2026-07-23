import { useState } from "react";

import { useTimeout } from "@/hooks/use-timeout";
import {
  initialQuickGenerationAssets,
  quickGenerationSizes,
  type QuickGenerationAsset,
} from "./QuickGeneration.constants";

export function useQuickGeneration() {
  const { schedule: scheduleGeneration } = useTimeout();
  const [assets, setAssets] = useState<QuickGenerationAsset[]>(
    initialQuickGenerationAssets,
  );
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(
    initialQuickGenerationAssets[0].id,
  );
  const [description, setDescription] = useState("");
  const [referenceImage, setReferenceImage] = useState("");
  const [size, setSize] = useState(initialQuickGenerationAssets[0].size);
  const [isGenerating, setIsGenerating] = useState(false);
  const currentAsset = assets.find((asset) => asset.id === currentAssetId);

  function selectAsset(asset: QuickGenerationAsset) {
    setCurrentAssetId(asset.id);
    setDescription("");
    setReferenceImage(asset.referenceImage);
    setSize(asset.size);
  }

  function newAsset() {
    setCurrentAssetId(null);
    setDescription("");
    setSize(quickGenerationSizes[1]);
    if (referenceImage) URL.revokeObjectURL(referenceImage);
    setReferenceImage("");
  }

  function generate() {
    if (!description.trim()) return;
    setIsGenerating(true);
    scheduleGeneration(() => {
      if (currentAsset) {
        setAssets((items) =>
          items.map((asset) =>
            asset.id === currentAsset.id
              ? { ...asset, prompt: description.trim(), referenceImage, size }
              : asset,
          ),
        );
      } else {
        const assetId = `asset-${Date.now()}`;
        const asset: QuickGenerationAsset = {
          id: assetId,
          prompt: description.trim(),
          referenceImage,
          size,
          previewClassName:
            "bg-[radial-gradient(circle_at_34%_28%,#f7d98c_0,transparent_24%),linear-gradient(145deg,#243847,#68808a)]",
        };
        setAssets((items) => [...items, asset]);
        setCurrentAssetId(assetId);
      }
      setDescription("");
      setIsGenerating(false);
    }, 700);
  }

  function deleteCurrentAsset() {
    if (!currentAsset) return;
    const remaining = assets.filter((asset) => asset.id !== currentAsset.id);
    setAssets(remaining);
    setCurrentAssetId(remaining[0]?.id ?? null);
    setReferenceImage(remaining[0]?.referenceImage ?? "");
    setSize(remaining[0]?.size ?? quickGenerationSizes[1]);
    setDescription("");
  }

  function chooseReference(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (referenceImage) URL.revokeObjectURL(referenceImage);
    setReferenceImage(URL.createObjectURL(file));
  }

  function clearReference() {
    if (referenceImage) URL.revokeObjectURL(referenceImage);
    setReferenceImage("");
  }

  return {
    assets,
    chooseReference,
    clearReference,
    currentAsset,
    currentAssetId,
    deleteCurrentAsset,
    description,
    generate,
    isGenerating,
    newAsset,
    quickGenerationSizes,
    referenceImage,
    selectAsset,
    setDescription,
    setSize,
    size,
  };
}
