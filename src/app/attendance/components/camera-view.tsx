"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start the webcam
  const startCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "user" }, 
      audio: false 
    });
    setStream(s);
    if (videoRef.current) videoRef.current.srcObject = s;
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      const data = canvasRef.current.toDataURL("image/jpeg");
      onCapture(data);
      stopCamera();
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    onClose();
  };

  // Auto-start
  useState(() => { startCamera(); });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button onClick={capture} className="rounded-full w-16 h-16 bg-white hover:bg-slate-200">
            <div className="w-12 h-12 border-4 border-slate-900 rounded-full" />
          </Button>
          <Button onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12 p-0">
            <X size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}