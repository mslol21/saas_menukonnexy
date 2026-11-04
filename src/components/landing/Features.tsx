'use client';
import { QrCode, MessageSquare, ChefHat, SlidersHorizontal } from 'lucide-react';
const features=[
 {Icon:QrCode,title:'Uma mesa, um QR Code',text:'Identifique a mesa no pedido e facilite o acesso ao cardápio sem imprimir uma nova versão a cada alteração.'},
 {Icon:MessageSquare,title:'Pedido pronto para o WhatsApp',text:'Produtos, quantidades e observações reunidos no carrinho para o cliente enviar ao seu atendimento.'},
 {Icon:ChefHat,title:'Cozinha e gestão no mesmo painel',text:'Acompanhe pedidos no monitor da cozinha e consulte os indicadores do seu restaurante.'},
 {Icon:SlidersHorizontal,title:'Cardápio com a sua identidade',text:'Organize categorias, personalize as cores e inclua informações e filtros alimentares nos produtos.'}
];
export function Features(){return <section id="funcionalidades" className="k-section"><div className="k-container"><div className="max-w-2xl mb-8"><p className="k-eyebrow mb-3">Na rotina do restaurante</p><h2 className="k-title">Menos mensagens para explicar.<br/>Mais clareza para escolher.</h2><p className="k-muted mt-4">Preço desatualizado, foto perdida na conversa e pedidos incompletos tomam tempo. Reúna as informações em um só lugar.</p></div><div className="grid md:grid-cols-2 gap-x-12">{features.map(({Icon,title,text})=><article className="k-feature" key={title}><Icon className="text-cyan-400 shrink-0 mt-1" size={24}/><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>}
