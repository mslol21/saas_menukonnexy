'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
const filters=[{id:'all',name:'Destaques'},{id:'burgers',name:'Hambúrgueres'},{id:'sides',name:'Porções'}];
export function MenuPreview() {
 const [category,setCategory]=useState('all');
 const products=MOCK_PRODUCTS.filter(p=>p.tenant_id==='t-1' && (category==='all'||(category==='sides'?p.category_id==='c-3':['c-1','c-2'].includes(p.category_id)))).slice(0,2);
 return <div className="k-demo-panel" aria-label="Prévia do cardápio de exemplo">
  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4"><span className="text-xs k-muted">VISÃO DO CLIENTE</span><span className="text-xs text-cyan-400">Demonstração</span></div>
  <div className="flex items-center gap-3 mt-5"><img src="/konnexy-logo.jpg" alt="" width={48} height={48} className="rounded-xl"/><div><p className="text-lg font-bold">Calixto Burger & Grill</p><p className="text-xs k-muted">Cardápio de exemplo · Konnexy Menu</p></div></div>
  <div className="k-demo-tabs" aria-label="Categorias da prévia">{filters.map(f=><button key={f.id} onClick={()=>setCategory(f.id)} aria-pressed={category===f.id}>{f.name}</button>)}</div>
  <div className="space-y-3 min-h-[224px]">{products.map(item=><Link href="/menu/calixto-burger" key={item.id} className="flex items-center gap-3 rounded-2xl p-3 border border-white/10 hover:border-cyan-400/50 transition-colors">
   <img src={item.image_url} alt={item.name} width={80} height={80} loading="lazy" className="w-20 h-20 rounded-xl object-cover shrink-0"/>
   <div className="min-w-0"><h2 className="text-sm font-semibold leading-snug">{item.name}</h2><p className="text-xs k-muted mt-1 line-clamp-2">{item.description}</p><p className="text-sm font-bold text-cyan-400 mt-2">{(item.promo_price||item.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p></div>
  </Link>)}</div>
  <Link href="/menu/calixto-burger" className="k-link k-link-secondary w-full mt-4">Abrir cardápio completo <ArrowUpRight size={17}/></Link>
  <p className="text-xs k-muted mt-3 flex items-center gap-2"><Check size={14}/> Experimente a busca, os filtros e o carrinho.</p>
 </div>;
}
export function DemoPreview() {
 return <section id="demonstracao" className="k-section border-y border-white/10"><div className="k-container">
  <div className="max-w-2xl"><p className="k-eyebrow mb-3">Como funciona</p><h2 className="k-title">Da primeira escolha ao pedido, sem complicação.</h2></div>
  <ol className="k-steps">{[
   ['01','Monte seu cardápio','Cadastre fotos, preços, categorias e informações de cada prato no painel.'],
   ['02','Compartilhe com o cliente','Use seu link nas redes sociais e imprima QR Codes para as mesas.'],
   ['03','Receba o pedido','O cliente escolhe os itens e envia o resumo para o WhatsApp do estabelecimento.']
  ].map(([n,t,d])=><li key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
 </div></section>;
}
