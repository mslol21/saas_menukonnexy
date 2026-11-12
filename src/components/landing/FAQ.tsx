import { ChevronDown } from 'lucide-react';
import { MENU_FAQS } from '@/lib/seo/content';

export function FAQ() {
  return (
    <section id="faq" className="py-20 relative" aria-labelledby="faq-title">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Antes de começar</span>
          <h2 id="faq-title" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">Dúvidas sobre o cardápio digital</h2>
        </div>
        <div className="space-y-4">
          {MENU_FAQS.map(({ q, a }, index) => (
            <details key={q} name="menu-faq" open={index === 0} className="group glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <summary className="list-none cursor-pointer w-full p-5 sm:p-6 text-left flex items-center justify-between font-bold text-white text-base hover:text-cyan-400 transition-colors [&::-webkit-details-marker]:hidden">
                <h3>{q}</h3>
                <ChevronDown aria-hidden="true" className="w-5 h-5 shrink-0 ml-3 text-cyan-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 sm:px-6 pb-6 text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-4">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
