"use client";

import { AnimatePresence } from "framer-motion";
import { ActionModal } from "@/components/ui/ActionModal";
import { WaterAction } from "./actions/WaterAction";
import { ManualAction } from "./actions/ManualAction";
import { BarcodeAction } from "./actions/BarcodeAction";
import { SearchAction } from "./actions/SearchAction";
import { Droplets, Plus, Barcode, Search } from "lucide-react";

export type ActionType = "water" | "manual" | "barcode" | "search" | null;

interface QuickActionsManagerProps {
  activeAction: ActionType;
  onClose: () => void;
  onRefresh: () => void;
}

export function QuickActionsManager({ activeAction, onClose, onRefresh }: QuickActionsManagerProps) {
  const handleSuccess = () => {
    onRefresh();
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {activeAction === "water" && (
        <ActionModal
          key="water-modal"
          title="Hidrasyon"
          subtitle="Su Tüketimini Kaydet"
          icon={Droplets}
          onClose={onClose}
        >
          <WaterAction onSuccess={handleSuccess} />
        </ActionModal>
      )}

      {activeAction === "manual" && (
        <ActionModal
          key="manual-modal"
          title="Manuel Ekle"
          subtitle="Hızlı Besin Girişi"
          icon={Plus}
          onClose={onClose}
        >
          <ManualAction onSuccess={handleSuccess} />
        </ActionModal>
      )}

      {activeAction === "barcode" && (
        <ActionModal
          key="barcode-modal"
          title="Vora Vision"
          subtitle="Barkod veya Fotoğraf"
          icon={Barcode}
          onClose={onClose}
        >
          <BarcodeAction onSuccess={handleSuccess} />
        </ActionModal>
      )}

      {activeAction === "search" && (
        <ActionModal
          key="search-modal"
          title="Yemek Ara"
          subtitle="Kütüphaneden Seç"
          icon={Search}
          onClose={onClose}
        >
          <SearchAction onSuccess={handleSuccess} />
        </ActionModal>
      )}
    </AnimatePresence>
  );
}
