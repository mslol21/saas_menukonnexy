'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Clock, Users, Flame, Utensils, CheckCircle2, MessageSquare } from 'lucide-react';
import { FILTER_OPTIONS } from '@/lib/mock-data';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedImg, setSelectedImg] = useState<string>('');

  if (!product) return null;

  const currentPrice = product.promo_price || product.price;
  const totalPrice = currentPrice * quantity;
  const mainImage = selectedImg || product.image_url;
  const galleryList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];

  const handleAddToCart = () => {
    addItem(product, quantity, notes);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Gallery Image Display */}
        <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-zinc-900">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>

        {/* Thumbnail Selector */}
        {galleryList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImg(img)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  mainImage === img ? 'border-orange-500 scale-105' : 'border-zinc-800 opacity-60'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Title & Description */}
        <div>
          <h2 className="text-2xl font-black text-white">{product.name}</h2>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{product.description}</p>
        </div>

        {/* Specifications grid (Weight, Calories, Time, Serves) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {product.prep_time_min && (
            <div className="p-3 rounded-xl glass-panel border border-white/10 text-center">
              <Clock className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Preparo</span>
              <span className="text-xs font-bold text-white">~{product.prep_time_min} min</span>
            </div>
          )}
          {product.weight && (
            <div className="p-3 rounded-xl glass-panel border border-white/10 text-center">
              <Utensils className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Peso</span>
              <span className="text-xs font-bold text-white">{product.weight}</span>
            </div>
          )}
          {product.calories && (
            <div className="p-3 rounded-xl glass-panel border border-white/10 text-center">
              <Flame className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Calorias</span>
              <span className="text-xs font-bold text-white">{product.calories} kcal</span>
            </div>
          )}
          {product.serves && (
            <div className="p-3 rounded-xl glass-panel border border-white/10 text-center">
              <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Serve</span>
              <span className="text-xs font-bold text-white">{product.serves} pessoa(s)</span>
            </div>
          )}
        </div>

        {/* Ingredients list */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Ingredientes & Composição</h4>
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.map((ing, i) => (
                <span key={i} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-zinc-300">
                  • {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter tags */}
        {product.filters && product.filters.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Selo de Qualidade & Dietas</h4>
            <div className="flex flex-wrap gap-1.5">
              {product.filters.map((fId) => {
                const opt = FILTER_OPTIONS.find((o) => o.id === fId);
                if (!opt) return null;
                return (
                  <span key={fId} className={`text-xs px-2.5 py-1 rounded-lg border ${opt.color}`}>
                    {opt.icon} {opt.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions Note */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-orange-400" /> Observações do Pedido
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Sem cebola, molho à parte, bem passado..."
            className="w-full px-4 py-2.5 rounded-xl glass-panel text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-white/10"
          />
        </div>

        {/* Quantity Controls & Add Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 glass-panel p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 active:scale-95"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-extrabold text-white w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            className="flex-1 justify-between text-base"
          >
            <span>Adicionar ao Pedido</span>
            <span className="font-black">R$ {totalPrice.toFixed(2)}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
