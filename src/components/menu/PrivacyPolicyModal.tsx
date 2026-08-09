'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck, Lock, FileText, Mail, CheckCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Política de Privacidade & LGPD">
      <div className="space-y-4 font-sans text-xs text-zinc-300 max-h-[70vh] overflow-y-auto pr-2">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="font-bold">
            Tratamento de dados em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" /> 1. Base Legal do Tratamento
          </h4>
          <p>
            O processamento dos seus dados de identificação (Nome e Número da Mesa/Endereço de Entrega) fundamenta-se estritamente na <strong>Execução de Contrato e Diligências Pré-Contratuais (Art. 7º, V da LGPD)</strong>, sendo indispensável para a preparação, identificação e entrega do seu pedido pelo restaurante.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" /> 2. Minimização & Não Armazenamento de Dados Financeiros
          </h4>
          <p>
            Não armazenamos dados bancários, senhas ou cartões de crédito. O pagamento é realizado diretamente pelo cliente via PIX ou maquininha física do restaurante.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-purple-400" /> 3. Anonimização para Fins Contábeis
          </h4>
          <p>
            Após 60 dias da conclusão do pedido, os dados de identificação pessoal são automaticamente <strong>anonimizados</strong>, preservando-se apenas os valores financeiros e itens para auditoria fiscal do restaurante sem expor a sua identidade.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-amber-400" /> 4. Encarregado de Proteção de Dados (DPO)
          </h4>
          <p>
            Para exercer seus direitos de confirmação, acesso ou retificação previstos no Art. 18 da LGPD, entre em contato com nosso encarregado pelo e-mail: <strong className="text-amber-400">dpo@konnexy.com.br</strong>.
          </p>
        </div>
      </div>
    </Modal>
  );
};
