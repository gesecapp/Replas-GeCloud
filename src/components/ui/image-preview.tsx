import { Camera, X } from 'lucide-react';
import { useState } from 'react';
import { CameraCaptureDialog } from '@/components/ui/image-capture';
import { ItemDescription, ItemMedia } from '@/components/ui/item';
import { cn } from '@/lib/utils';
import { Button } from './button';

export default function ImagePreview({ value, onChange, className, height }: ImagePreviewProps) {
  const [cameraOpen, setCameraOpen] = useState(false);

  function handleCapture(image: string) {
    onChange(image);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(undefined);
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          'group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:bg-secondary',
          className,
        )}
        style={{ height: height || 192 }}
        onClick={() => setCameraOpen(true)}
      >
        {value ? (
          <>
            <ItemMedia variant="image" className="h-full w-full">
              <img src={value} alt="prévia" className="h-full w-full object-contain" />
            </ItemMedia>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex size-10 items-center justify-center rounded-md text-white hover:bg-white/20">
                <Camera className="size-6" />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="absolute top-2 right-2 z-10 size-7 transition-opacity group-hover:opacity-100 sm:opacity-0"
              onClick={handleRemove}
            >
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <ItemMedia variant="icon" className="text-muted-foreground">
              <Camera className="size-8" />
            </ItemMedia>
            <ItemDescription className="text-center text-xs">Toque para capturar uma foto</ItemDescription>
          </div>
        )}
      </button>

      <CameraCaptureDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />
    </>
  );
}

interface ImagePreviewProps {
  value?: string;
  onChange: (image: string | undefined) => void;
  className?: string;
  height?: number | string;
}
