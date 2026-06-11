import { RefObject, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { Link as LinkIcon, Download, Check, BookmarkPlus } from 'lucide-react';
import { Coordinate, CoordinateScore } from '@/types';
import { SaveCoordinateModal } from './SaveCoordinateModal';
import { Toast } from '@/components/ui/Toast';
import { useFavoritesStore } from '@/store/favoritesStore';
import { buildTweetText, buildTwitterIntentUrl } from '@/utils/shareToX';

interface ShareActionsProps {
  coordinate: Coordinate;
  currentScore?: CoordinateScore | null;
  previewRef: RefObject<HTMLDivElement | null>;
  hideSaveButton?: boolean;
}

export function ShareActions({ coordinate, currentScore, previewRef, hideSaveButton = false }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingX, setExportingX] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { addCoordinate } = useFavoritesStore();

  const getShareUrl = () => {
    const params = new URLSearchParams();
    if (coordinate.headId) params.set('h', coordinate.headId);
    if (coordinate.bodyId) params.set('b', coordinate.bodyId);
    if (coordinate.shoesId) params.set('s', coordinate.shoesId);
    return `${window.location.origin}/c?${params.toString()}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleExportPng = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    
    try {
      // Create a blob directly for mobile compatibility
      const blob = await toBlob(previewRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff'
      });
      
      if (!blob) throw new Error('Failed to create blob');

      // Check if Web Share API is available and can share files (typically mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'inkclo.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'inkclo-coordinate.png', { type: 'image/png' });
        await navigator.share({
          title: 'My Splatoon3 Coordinate',
          text: buildTweetText(coordinate, currentScore || null),
          files: [file]
        });
      } else {
        // Fallback for PC or unsupported browsers
        const dataUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'inkclo-coordinate.png';
        link.href = dataUrl;
        link.click();
        URL.revokeObjectURL(dataUrl);
      }
    } catch (err) {
      console.error('Failed to export PNG', err);
      // Fallback to data URL if blob fails
      try {
        const dataUrl = await toPng(previewRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
        const link = document.createElement('a');
        link.download = 'inkclo-coordinate.png';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.error('Fallback export failed', e);
      }
    } finally {
      setExporting(false);
    }
  };

  const handleShareToX = async () => {
    setExportingX(true);
    
    // Build text & URL
    const baseText = buildTweetText(coordinate, currentScore || null);
    const url = getShareUrl();

    try {
      if (!previewRef.current) throw new Error('No preview ref');

      const blob = await toBlob(previewRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
      if (!blob) throw new Error('Failed to create blob');

      // 1. Try Web Share API (Mobile native sharing)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'inkclo.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'inkclo-coordinate.png', { type: 'image/png' });
        await navigator.share({
          title: 'INKCLO Coordinate',
          text: baseText + '\n' + url,
          files: [file]
        });
        setExportingX(false);
        return; // Success via native share, exit
      }

      // 2. Try Clipboard API (PC)
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setToastMessage('画像をコピーしました！投稿画面でペースト（Ctrl+V）して添付してください。');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Failed to share image', err);
      setToastMessage('共有画面を開きます（画像のクリップボードコピーには非対応の環境です）');
      setShowToast(true);
    } finally {
      setExportingX(false);
    }

    // Open Twitter intent as fallback/continuation
    const intentUrl = buildTwitterIntentUrl(baseText, url);
    window.open(intentUrl, '_blank');
  };

  const handleSave = (name: string) => {
    addCoordinate({
      id: crypto.randomUUID(),
      name,
      headId: coordinate.headId,
      bodyId: coordinate.bodyId,
      shoesId: coordinate.shoesId,
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(false);
    setToastMessage('お気に入りに保存しました');
    setShowToast(true);
  };

  const isReady = coordinate.headId || coordinate.bodyId || coordinate.shoesId;

  if (!isReady) return null;

  return (
    <div className="w-full flex flex-col mt-3 gap-2">
      <div className="flex gap-2 w-full">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
          <span className="text-xs">URLコピー</span>
        </button>
        <button
          onClick={handleExportPng}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <Download size={16} />
          <span className="text-xs">画像保存</span>
        </button>
      </div>

      <button
        onClick={handleShareToX}
        disabled={exportingX}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50"
      >
        <span className="font-serif italic text-lg leading-none mt-0.5">𝕏</span>
        <span className="text-xs">で共有</span>
      </button>

      {!hideSaveButton && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <BookmarkPlus size={16} />
          <span className="text-xs">お気に入り保存</span>
        </button>
      )}

      <SaveCoordinateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
