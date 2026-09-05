'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Fabric.js tipleri
type FabricCanvas = any;
type FabricObject = any;

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'etiket1';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas>(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [selectedObj, setSelectedObj] = useState<FabricObject | null>(null);

  // Ayarlar
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');

  // Canvas boyutları (etiket PNG boyutu)
  const CANVAS_W = 620;
  const CANVAS_H = 250;

  // Fabric.js yükle
  useEffect(() => {
    const loadFabric = async () => {
      const fabric = (await import('fabric')).default;

      if (!canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });

      // Arka plan olarak etiket PNG'sini yükle
      fabric.Image.fromURL(
        `/etiketler/${template}.png`,
        (img: any) => {
          img.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            scaleX: CANVAS_W / (img.width || CANVAS_W),
            scaleY: CANVAS_H / (img.height || CANVAS_H),
          });
          canvas.add(img);
          canvas.sendToBack(img);
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );

      // Obje seçildiğinde
      canvas.on('selection:created', (e: any) => {
        const obj = e.selected?.[0];
        if (obj && obj.type === 'i-text') {
          setSelectedObj(obj);
          setFontFamily(obj.fontFamily || 'Arial');
          setFontSize(obj.fontSize || 24);
          setFontColor(obj.fill || '#000000');
          setFontWeight(obj.fontWeight || 'normal');
          setFontStyle(obj.fontStyle || 'normal');
        }
      });

      canvas.on('selection:updated', (e: any) => {
        const obj = e.selected?.[0];
        if (obj && obj.type === 'i-text') {
          setSelectedObj(obj);
          setFontFamily(obj.fontFamily || 'Arial');
          setFontSize(obj.fontSize || 24);
          setFontColor(obj.fill || '#000000');
          setFontWeight(obj.fontWeight || 'normal');
          setFontStyle(obj.fontStyle || 'normal');
        }
      });

      canvas.on('selection:cleared', () => {
        setSelectedObj(null);
      });

      fabricCanvasRef.current = canvas;
      setFabricLoaded(true);
    };

    loadFabric();

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, [template]);

  // Metin ekle
  const addText = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const fabric = require('fabric').default;

    const text = new fabric.IText('Metin', {
      left: CANVAS_W / 2 - 40,
      top: CANVAS_H / 2 - 15,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: fontColor,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      editable: true,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    setSelectedObj(text);
  }, [fontFamily, fontSize, fontColor, fontWeight, fontStyle]);

  // Seçili obje özelliklerini güncelle
  const updateProperty = useCallback(
    (prop: string, value: any) => {
      if (!selectedObj || !fabricCanvasRef.current) return;
      selectedObj.set(prop, value);
      fabricCanvasRef.current.renderAll();
    },
    [selectedObj]
  );

  // Seçili objeyi sil
  const deleteSelected = useCallback(() => {
    if (!selectedObj || !fabricCanvasRef.current) return;
    fabricCanvasRef.current.remove(selectedObj);
    fabricCanvasRef.current.renderAll();
    setSelectedObj(null);
  }, [selectedObj]);

  // İlerle → A4 baskı sayfasına git
  const handleNext = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    // Seçimi kaldır (mavi kutu görünmesin)
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.renderAll();

    // Canvas'ı PNG olarak export et
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    // sessionStorage'a kaydet (print sayfasında kullanacağız)
    sessionStorage.setItem('etiket-image', dataURL);
    router.push('/print');
  }, [router]);

  const fonts = [
    'Arial',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Üst Bar */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between no-print">
        <button
          onClick={() => router.push('/')}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2"
        >
          ← Geri
        </button>
        <h2 className="text-lg font-bold text-gray-700 capitalize">
          {template.replace('etiket', 'Şablon ')}
        </h2>
        <button
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 
                     rounded-lg font-bold text-lg transition-colors"
        >
          İlerle →
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel - Araçlar */}
        <aside className="w-72 bg-white shadow-md p-4 overflow-y-auto no-print">
          <h3 className="font-bold text-gray-700 mb-4 text-lg">🛠️ Araçlar</h3>

          <button
            onClick={addText}
            disabled={!fabricLoaded}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 
                       rounded-lg font-semibold mb-6 transition-colors 
                       disabled:opacity-50"
          >
            + Metin Kutusu Ekle
          </button>

          {selectedObj && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-600">📝 Metin Ayarları</h4>

              {/* Font Ailesi */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Font Ailesi
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    updateProperty('fontFamily', e.target.value);
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {fonts.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Boyutu */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Boyut: {fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="80"
                  value={fontSize}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFontSize(v);
                    updateProperty('fontSize', v);
                  }}
                  className="w-full"
                />
              </div>

              {/* Renk */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Renk</label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => {
                    setFontColor(e.target.value);
                    updateProperty('fill', e.target.value);
                  }}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              {/* Kalın / İtalik */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const w = fontWeight === 'bold' ? 'normal' : 'bold';
                    setFontWeight(w);
                    updateProperty('fontWeight', w);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold border-2 transition-colors ${
                    fontWeight === 'bold'
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  K
                </button>
                <button
                  onClick={() => {
                    const s = fontStyle === 'italic' ? 'normal' : 'italic';
                    setFontStyle(s);
                    updateProperty('fontStyle', s);
                  }}
                  className={`flex-1 py-2 rounded-lg italic border-2 transition-colors ${
                    fontStyle === 'italic'
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  İ
                </button>
              </div>

              {/* Sil */}
              <button
                onClick={deleteSelected}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 
                           rounded-lg font-semibold transition-colors mt-4"
              >
                🗑️ Seçili Metni Sil
              </button>
            </div>
          )}

          {!selectedObj && (
            <p className="text-gray-400 text-sm mt-4">
              💡 Bir metin kutusuna tıklayarak düzenleyebilirsiniz. Çift tıklayarak
              yazıyı değiştirebilirsiniz.
            </p>
          )}
        </aside>

        {/* Orta - Canvas Alanı */}
        <main className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <canvas ref={canvasRef} className="border border-gray-200 rounded" />
            <p className="text-xs text-gray-400 text-center mt-2">
              52.5mm × 21.2mm (300 DPI — 620×250px)
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
