import { RefObject, useState } from 'react';
import { toPng } from 'html-to-image';
import { Link as LinkIcon, Download, Check } from 'lucide-react';
import { Coordinate } from '@/types';

interface ShareActionsProps {
  coordinate: Coordinate;
  previewRef: RefObject<HTMLDivElement | null>;
}

export function ShareActions({ coordinate, previewRef }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopyLink = async () => {
    const params = new URLSearchParams();
    if (coordinate.headId) params.set('h', coordinate.headId);
    if (coordinate.bodyId) params.set('b', coordinate.bodyId);
    if (coordinate.shoesId) params.set('s', coordinate.shoesId);

    const url = `${window.location.origin}/c?${params.toString()}`;
    
    try {
      await navigator.clipboard.writeText(url);
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
      const dataUrl = await toPng(previewRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff',
        style: {
          padding: '24px',
          borderRadius: '16px'
        }
      });
      const link = document.createElement('a');
      link.download = 'inclo-coordinate.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG', err);
    } finally {
      setExporting(false);
    }
  };

  const isReady = coordinate.headId || coordinate.bodyId || coordinate.shoesId;

  if (!isReady) return null;

  return (
    <div className="flex gap-3 mt-6 w-full">
      <button
        onClick={handleCopyLink}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-colors"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
        <span>{copied ? 'コピー完了' : 'URLコピー'}</span>
      </button>
      
      <button
        onClick={handleExportPng}
        disabled={exporting}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <Download size={18} />
        <span>{exporting ? '処理中...' : '画像保存'}</span>
      </button>
    </div>
  );
}
