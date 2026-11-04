'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { MenuPreview } from './DemoPreview';
export function Hero() {
 return <section className="k-hero"><div className="k-container k-hero-grid">
  <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
   <p className="k-eyebrow mb-5">Konnexy Menu · Do cardápio ao pedido</p>
   <h1>Seu cardápio na mão do cliente.<br/><span className="text-gradient">Seus pedidos organizados.</span></h1>
   <p className="k-muted mt-6 max-w-xl">Para restaurantes, lanchonetes e cafés: apresente seus pratos, compartilhe por link ou QR Code e receba o pedido no WhatsApp.</p>
   <div className="flex flex-col sm:flex-row gap-3 mt-7"><Link href="/login" className="k-link k-link-primary">Começar meu cardápio <ArrowRight size={18}/></Link><Link href="/menu/calixto-burger" className="k-link k-link-secondary">Explorar demonstração</Link></div>
   <ul className="flex flex-wrap gap-x-5 gap-y-3 mt-7 text-sm k-muted">{['Sem comissão por pedido','Preços fáceis de atualizar','QR Code por mesa'].map(t=><li key={t} className="flex items-center gap-2"><Check size={15} className="text-cyan-400"/>{t}</li>)}</ul>
  </motion.div>
  <MenuPreview />
 </div></section>;
}
