'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Preciso pagar comissão por pedido realizado?',
    a: 'Não! O Konnexy Menu não cobra nenhuma porcentagem sobre suas vendas. Você paga apenas o valor fixo da sua assinatura mensal ou anual.',
  },
  {
    q: 'Como funciona o envio de pedidos para o WhatsApp?',
    a: 'Quando o cliente finaliza a escolha dos pratos e seleciona se é consumo na mesa, retirada ou entrega, nosso sistema compõe uma mensagem formatada e limpa e envia diretamente para o número do WhatsApp do seu estabelecimento.',
  },
  {
    q: 'Consigo gerar QR Codes para cada mesa do meu restaurante?',
    a: 'Sim! Nosso gerador de QR Code no painel administrativo permite criar QR Codes genéricos ou vinculados especificamente a um número de mesa.',
  },
  {
    q: 'Como funciona o recurso de PWA (Aplicativo)?',
    a: 'O cardápio abre pelo navegador e pode ser adicionado à tela inicial nos dispositivos compatíveis. É necessária conexão para carregar informações atualizadas e enviar pedidos.',
  },
  {
    q: 'Posso alterar preços e cadastrar novos produtos a qualquer momento?',
    a: 'Sim, através do painel administrativo você altera preços, oculta itens esgotados, adiciona fotos, fotos em galeria, tags de alérgenos e categorias em tempo real.',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">Tire Suas Dúvidas</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <button
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-white text-base hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 ml-3 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : 'text-zinc-400'}`} />
                </button>
                {isOpen && (
                  <div id={`faq-answer-${index}`} className="px-6 pb-6 text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
