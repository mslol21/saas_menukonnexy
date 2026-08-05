'use client';

import React, { useState } from 'react';
import { Product, Category, FilterTag } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Package, Upload, Image as ImageIcon } from 'lucide-react';
import { FILTER_OPTIONS } from '@/lib/mock-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  onUpdateProducts: (prods: Product[]) => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  categories,
  onUpdateProducts,
}) => {
  const [prods, setProds] = useState<Product[]>(products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Partial<Product> | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleOpenAdd = () => {
    setEditingProd({
      name: '',
      slug: '',
      category_id: categories[0]?.id || 'c-1',
      description: '',
      price: 29.90,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
      ingredients: [],
      filters: [],
      is_available: true,
      is_featured: false,
      is_bestseller: false,
      is_new: true,
      is_promo: false,
      sort_order: prods.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProd(p);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      const updated = prods.filter((p) => p.id !== id);
      setProds(updated);
      onUpdateProducts(updated);
    }
  };

  const handleProductFileUpload = async (file: File) => {
    if (!file || !editingProd) return;
    setIsUploadingImage(true);

    try {
      if (isSupabaseConfigured()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `prod-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('images').upload(fileName, file, { upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            setEditingProd({ ...editingProd, image_url: publicUrlData.publicUrl });
            setIsUploadingImage(false);
            return;
          }
        }
      }

      // Fallback Data URL reader
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setEditingProd({ ...editingProd, image_url: result });
        }
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Product image upload error:', err);
      setIsUploadingImage(false);
    }
  };

  const toggleFilterTag = (tag: FilterTag) => {
    if (!editingProd) return;
    const current = editingProd.filters || [];
    const exists = current.includes(tag);
    const updatedFilters = exists ? current.filter((t) => t !== tag) : [...current, tag];
    setEditingProd({ ...editingProd, filters: updatedFilters });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd?.name || !editingProd.price) return;

    const slug = editingProd.slug || editingProd.name.toLowerCase().replace(/\s+/g, '-');

    if (editingProd.id) {
      const updated = prods.map((p) => (p.id === editingProd.id ? ({ ...p, ...editingProd, slug } as Product) : p));
      setProds(updated);
      onUpdateProducts(updated);
    } else {
      const newProd: Product = {
        id: `p-${Date.now()}`,
        tenant_id: 't-1',
        category_id: editingProd.category_id || categories[0]?.id || 'c-1',
        name: editingProd.name,
        slug,
        description: editingProd.description || '',
        price: Number(editingProd.price),
        promo_price: editingProd.promo_price ? Number(editingProd.promo_price) : undefined,
        image_url: editingProd.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
        gallery: editingProd.gallery || [],
        ingredients: editingProd.ingredients || [],
        weight: editingProd.weight,
        calories: editingProd.calories,
        prep_time_min: editingProd.prep_time_min,
        serves: editingProd.serves || 1,
        is_available: editingProd.is_available ?? true,
        sort_order: editingProd.sort_order || prods.length + 1,
        is_featured: editingProd.is_featured || false,
        is_bestseller: editingProd.is_bestseller || false,
        is_new: editingProd.is_new || false,
        is_promo: editingProd.is_promo || false,
        filters: editingProd.filters || [],
      };
      const updated = [...prods, newProd];
      setProds(updated);
      onUpdateProducts(updated);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Cadastre & Gerencie Pratos
          </h2>
          <p className="text-xs text-zinc-400">Envie fotos do dispositivo ou informe URLs de imagens do seu cardápio.</p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prods.map((p) => (
          <div key={p.id} className="glass-panel p-4 rounded-3xl border border-white/10 flex gap-4 items-center justify-between">
            <img src={p.image_url} alt={p.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
              <p className="text-xs text-zinc-400 line-clamp-1">{p.description}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-black text-amber-400">
                  R$ {p.promo_price ? p.promo_price.toFixed(2) : p.price.toFixed(2)}
                </span>
                {p.promo_price && <span className="text-xs text-zinc-500 line-through">R$ {p.price.toFixed(2)}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => handleOpenEdit(p)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Produto */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProd?.id ? 'Editar Produto' : 'Novo Produto'} maxWidth="xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Nome do Prato *</label>
              <input
                type="text"
                value={editingProd?.name || ''}
                onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Categoria *</label>
              <select
                value={editingProd?.category_id || ''}
                onChange={(e) => setEditingProd({ ...editingProd, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-amber-500/50"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Descrição</label>
            <textarea
              rows={2}
              value={editingProd?.description || ''}
              onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Preço Regular (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={editingProd?.price || 0}
                onChange={(e) => setEditingProd({ ...editingProd, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Preço Promocional (Opcional)</label>
              <input
                type="number"
                step="0.01"
                value={editingProd?.promo_price || ''}
                onChange={(e) => setEditingProd({ ...editingProd, promo_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Product Image Upload or URL */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" /> Foto do Produto
            </label>

            <div className="flex items-center gap-3">
              <img
                src={editingProd?.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop'}
                alt="Preview"
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-amber-500/50"
              />

              <div className="flex-1 space-y-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/40 text-xs font-bold transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingImage ? 'Enviando...' : 'Enviar Imagem do Dispositivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleProductFileUpload(e.target.files[0])}
                  />
                </label>

                <input
                  type="text"
                  value={editingProd?.image_url || ''}
                  onChange={(e) => setEditingProd({ ...editingProd, image_url: e.target.value })}
                  placeholder="Ou cole a URL da imagem do produto"
                  className="w-full px-3 py-1.5 rounded-xl glass-panel text-xs text-white border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Filter Tags selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">Selos Dietéticos & Filtros</label>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map((opt) => {
                const active = editingProd?.filters?.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleFilterTag(opt.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      active ? 'bg-amber-500 text-zinc-950 font-black border-amber-400' : 'bg-white/5 text-zinc-400 border-white/10'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Salvar Produto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
