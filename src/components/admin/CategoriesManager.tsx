'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Layers, MoveUp, MoveDown } from 'lucide-react';

interface CategoriesManagerProps {
  categories: Category[];
  onUpdateCategories: (cats: Category[]) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  onUpdateCategories,
}) => {
  const [cats, setCats] = useState<Category[]>(categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);

  const handleOpenAdd = () => {
    setEditingCat({ name: '', slug: '', sort_order: cats.length + 1, is_active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Os produtos associados serão afetados.')) {
      const updated = cats.filter((c) => c.id !== id);
      setCats(updated);
      onUpdateCategories(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat?.name) return;

    const slug = editingCat.slug || editingCat.name.toLowerCase().replace(/\s+/g, '-');

    if (editingCat.id) {
      // Update
      const updated = cats.map((c) => (c.id === editingCat.id ? ({ ...c, ...editingCat, slug } as Category) : c));
      setCats(updated);
      onUpdateCategories(updated);
    } else {
      // Create
      const newCat: Category = {
        id: `c-${Date.now()}`,
        tenant_id: 't-1',
        name: editingCat.name,
        slug,
        sort_order: editingCat.sort_order || cats.length + 1,
        is_active: editingCat.is_active ?? true,
      };
      const updated = [...cats, newCat];
      setCats(updated);
      onUpdateCategories(updated);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" /> Gerenciador de Categorias
          </h2>
          <p className="text-xs text-zinc-400">Organize os grupos do seu cardápio (ex: Burgers, Bebidas, Sobremesas).</p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Nova Categoria
        </Button>
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-zinc-400">
            <tr>
              <th className="p-4">Ordem</th>
              <th className="p-4">Nome da Categoria</th>
              <th className="p-4">Slug URL</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cats.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-orange-400">#{c.sort_order}</td>
                <td className="p-4 font-bold text-white">{c.name}</td>
                <td className="p-4 text-zinc-400 text-xs font-mono">/menu/{c.slug}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${c.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {c.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(c)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit Category */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCat?.id ? 'Editar Categoria' : 'Nova Categoria'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Nome da Categoria *</label>
            <input
              type="text"
              value={editingCat?.name || ''}
              onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
              placeholder="Ex: 🍕 Pizzas Artesanais"
              className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Ordem de Exibição</label>
            <input
              type="number"
              value={editingCat?.sort_order || 1}
              onChange={(e) => setEditingCat({ ...editingCat, sort_order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Salvar Categoria</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
