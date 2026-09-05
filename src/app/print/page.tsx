'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrintPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const img = sessionStorage.getItem('etiket-image');
    if (img) {
      setImageData(img);
    } else {
      router.push('/');
    }
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  // 4 sütun × 14 satır = 56 etiket
  const columns = 4;
  const rows = 14;
  const total = columns * rows;

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Kontrol Butonları (baskıda gizlenecek) */}
      <div className="no-print fixed top-4 left-4 right-4 z-50 flex items-center justify-between bg-white rounded-xl shadow-lg px-6 py-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 font-medium"
        >
          ← Düzenlemeye Dön
        </button>
        <h2 className="text-lg font-bold text-gray-700">
          🖨️ A4 Önizleme — 56 Etiket
        </h2>
        <button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 
                     rounded-lg font-bold text-lg transition-colors"
        >
          🖨️ YAZDIR
        </button>
      </div>

      {/* A4 Kağıt */}
      <div className="no-print h-16" />
      <div className="flex justify-center py-8">
        <div
          id="print-area"
          style={{
            width: '210mm',
            height: '297mm',
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 52.5mm)`,
            gridTemplateRows: `repeat(${rows}, 21.2mm)`,
            padding: 0,
            margin: 0,
            gap: 0,
          }}
        >
          {imageData &&
            Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '52.5mm',
                  height: '21.2mm',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={imageData}
                  alt={`etiket-${i}`}
                  style={{
                    width: '52.5mm',
                    height: '21.2mm',
                    objectFit: 'fill',
                    display: 'block',
                  }}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
