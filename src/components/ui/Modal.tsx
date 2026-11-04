'use client';
import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
interface ModalProps { isOpen:boolean; onClose:()=>void; title?:string; children:React.ReactNode; maxWidth?:'sm'|'md'|'lg'|'xl'|'2xl'; }
export function Modal({isOpen,onClose,title,children,maxWidth='md'}:ModalProps){
 const dialog=useRef<HTMLDialogElement>(null);
 const titleId=useId();
 useEffect(()=>{
  const node=dialog.current;
  if(!node) return;
  if(!isOpen){ if(node.open) node.close(); return; }
  const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;
  node.showModal();
  document.body.style.overflow='hidden';
  return ()=>{ node.close(); document.body.style.overflow=overflow; previous?.focus(); };
 },[isOpen]);
 const widths={sm:'max-w-sm',md:'max-w-md',lg:'max-w-lg',xl:'max-w-xl','2xl':'max-w-2xl'};
 return <dialog ref={dialog} aria-labelledby={title?titleId:undefined} aria-label={title?undefined:'Detalhes'} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}} className={`k-modal w-[calc(100%-32px)] ${widths[maxWidth]} m-auto rounded-3xl glass-panel border border-white/10 p-6 shadow-2xl text-white`}>
  <div className="flex items-start gap-4 justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
   {title&&<h2 id={titleId} className="text-lg font-bold leading-snug pt-2">{title}</h2>}
   <button type="button" onClick={onClose} aria-label="Fechar janela" className="w-11 h-11 shrink-0 rounded-xl text-zinc-400 hover:bg-white/10 ml-auto flex items-center justify-center"><X size={20}/></button>
  </div>
  <div className="k-modal-body">{children}</div>
 </dialog>;
}
