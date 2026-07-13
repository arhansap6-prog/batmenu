import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Copy, Printer, Settings } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface QRProps {
  restaurantId: string;
  restaurantName: string;
  qrLink: string;
}

export default function QRCodeSystem({ restaurantId, restaurantName, qrLink }: QRProps) {
  const [qrImage, setQrImage] = useState<string>('');
  const [customizing, setCustomizing] = useState(false);
  const [settings, setSettings] = useState({
    size: 'medium' as 'small' | 'medium' | 'large',
    color: '#000000',
    bgColor: '#FFFFFF'
  });

  // Generate QR code
  const generateQR = async (url: string) => {
    try {
      const sizes = { small: 200, medium: 300, large: 500 };
      const dataUrl = await QRCode.toDataURL(url, {
        width: sizes[settings.size],
        color: {
          dark: settings.color,
          light: settings.bgColor
        },
        errorCorrectionLevel: 'H'
      });
      setQrImage(dataUrl);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  // Download QR
  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `batmenu-${restaurantName.toLowerCase()}-qr.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(qrLink);
    toast.success('Link copied to clipboard!');
  };

  // Print QR
  const printQR = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${restaurantName}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial; }
              img { width: 300px; height: 300px; margin: 20px; }
              h2 { margin: 0; }
            </style>
          </head>
          <body>
            <h2>${restaurantName}</h2>
            <p>Scan to view menu</p>
            <img src="${qrImage}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-display text-white mb-2">QR Code</h2>
        <p className="text-white/50 text-sm">Unique QR for {restaurantName}</p>
      </div>

      {/* QR Display */}
      <motion.div
        className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/20 bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {!qrImage && (
          <button
            onClick={() => generateQR(qrLink)}
            className="px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition"
          >
            Generate QR Code
          </button>
        )}

        {qrImage && (
          <>
            <img src={qrImage} alt="QR Code" className="w-48 h-48 mb-4" />
            <p className="text-white/50 text-sm text-center">
              {restaurantName}<br />
              <span className="text-xs">Scan to view menu</span>
            </p>
          </>
        )}
      </motion.div>

      {qrImage && (
        // Action Buttons
        <div className="space-y-3">
          <button
            onClick={downloadQR}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition"
          >
            <Download size={18} /> Download QR
          </button>

          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
          >
            <Copy size={18} /> Copy Link
          </button>

          <button
            onClick={printQR}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
          >
            <Printer size={18} /> Print QR
          </button>

          <button
            onClick={() => setCustomizing(!customizing)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
          >
            <Settings size={18} /> Customize
          </button>
        </div>
      )}

      {customizing && (
        // Customization Panel
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
        >
          <div>
            <label className="block text-white/70 text-sm mb-2">QR Size</label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setSettings({ ...settings, size });
                    generateQR(qrLink);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm uppercase tracking-wider transition ${
                    settings.size === size
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-white/70 text-sm mb-2">QR Color</label>
              <input
                type="color"
                value={settings.color}
                onChange={(e) => {
                  setSettings({ ...settings, color: e.target.value });
                  generateQR(qrLink);
                }}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white/70 text-sm mb-2">Background</label>
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => {
                  setSettings({ ...settings, bgColor: e.target.value });
                  generateQR(qrLink);
                }}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-white/70 text-sm">
          <strong>Link:</strong> {qrLink}
        </p>
      </div>
    </div>
  );
}

