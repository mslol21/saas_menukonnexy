'use client';

import React from 'react';
import { Product } from '@/types';
import { Plus, Minus, Flame, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { FILTER_OPTIONS } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  primaryColor?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, primaryColor = '#B8860B' }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantityInCart > 0) {
      updateQuantity(product.id, quantityInCart - 1);
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="glass-panel rounded-3xl p-4 border border-white/10 hover:border-amber-500/40 transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row gap-4 relative overflow-hidden"
    >
      {/* Product Image & Badges */}
      <div className="relative w-full sm:w-40 h-44 sm:h-40 rounded-2xl overflow-hidden bg-zinc-900 shrink-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_promo && (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              PROMOÇÃO
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
              <Flame className="w-3 h-3 fill-black" /> MAIS VENDIDO
            </span>
          )}
          {product.is_new && (
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
              NOVO
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
              {product.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Filter Tags */}
          {product.filters && product.filters.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {product.filters.map((fId) => {
                const opt = FILTER_OPTIONS.find((o) => o.id === fId);
                if (!opt) return null;
                return (
                  <span
                    key={fId}
                    className={`text-[10px] px-2 py-0.5 rounded-md border ${opt.color}`}
                  >
                    {opt.icon} {opt.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Additional details */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
            {product.weight && <span>{product.weight}</span>}
            {product.prep_time_min && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" /> ~{product.prep_time_min} min
              </span>
            )}
            {product.calories && <span>{product.calories} kcal</span>}
          </div>
        </div>

        {/* Price & Fast Quantity Counter Controls */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-white">
              R$ {product.promo_price ? product.promo_price.toFixed(2) : product.price.toFixed(2)}
            </span>
            {product.promo_price && (
              <span className="text-xs text-zinc-500 line-through">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick Add or Instant Counter using primary color */}
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/10 border border-white/20">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors font-bold text-xs active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-black text-amber-400 min-w-[20px] text-center">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                style={{ backgroundColor: primaryColor }}
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center transition-colors font-bold text-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              style={{ backgroundColor: primaryColor }}
              className="px-3.5 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 active:scale-95 shadow-md hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
