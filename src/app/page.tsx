'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [etiketler, setEtiketler] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/etiketler/manifest.json')
      .then((res) => res.json())
      .then((data: string[]) => {
        setEtiketler(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: manuel liste
        setEtiketler([
          'etiket1', 'etiket2', 'etiket3', 'etiket4', 'etiket5',
          'etiket6', 'etiket7', 'etiket8', 'etiket9', 'etiket10',
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏷️ Etiket Oluşturucu
          </h1>
          <p className="text-gray-500 text-lg">
            Bir şablon seçin ve etiketinizi özelleştirin
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-xl py-20">
            Yükleniyor...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {etiketler.map((etiket) => (
              <button
                key={etiket}
                onClick={() => router.push(`/editor?template=${etiket}`)}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl 
                           transition-all duration-300 p-4 hover:-translate-y-1 
                           border-2 border-transparent hover:border-blue-400 text-left"
              >
                <div className="aspect-[620/250] bg-gray-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                  <img
                    src={`/etiketler/${etiket}.jpg`}
                    alt={etiket}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 text-center capitalize">
                  {etiket.replace('etiket', 'Şablon ')}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
