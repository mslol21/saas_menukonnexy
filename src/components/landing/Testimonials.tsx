'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Carlos Eduardo',
    role: 'Proprietário do Calixto Burger',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop',
    comment: 'O Konnexy Menu substituiu nossos cardápios de papel e diminuiu em 40% o tempo de atendimento das mesas. O pedido chega perfeito no WhatsApp!',
    stars: 5,
  },
  {
    name: 'Mariana Silva',
    role: 'Gerente no Bistrô Bellíssimo',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&fit=crop',
    comment: 'A velocidade e o visual estilo Apple deixaram nossos clientes impressionados. Além disso, não pagamos nenhuma comissão sobre as vendas.',
    stars: 5,
  },
  {
    name: 'Rafael Mendes',
    role: 'Sócio do Açaí & Juice Bar',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop',
    comment: 'O gerador de QR Code por mesa facilitou demais a operação. Cadastramos mais de 80 itens em menos de 20 minutos no painel.',
    stars: 5,
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Depoimentos Realistas</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Quem usa o Konnexy Menu aprova e recomenda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev, index) => (
            <div key={index} className="glass-panel p-8 rounded-3xl border border-white/10 relative flex flex-col justify-between">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-white/10" />
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm italic leading-relaxed mb-6">"{rev.comment}"</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <img src={rev.image} alt={rev.name} className="w-10 h-10 rounded-full object-cover border border-orange-500/50" />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{rev.name}</h4>
                  <span className="text-xs text-zinc-400">{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
