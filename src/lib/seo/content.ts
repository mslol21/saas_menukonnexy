export const MENU_PLANS = {
  monthly: { price: 59.9, label: '59,90', duration: 'P1M' },
  annual: { price: 599.9, label: '599,90', duration: 'P1Y' },
} as const;

export const MENU_FAQS = [
  {
    q: 'O que é o Konnexy Menu e para quem serve?',
    a: 'O Konnexy Menu é um sistema de cardápio digital para restaurantes, lanchonetes, hamburguerias, pizzarias, bares e cafeterias. Reúne produtos, fotos, preços e categorias em um link que o estabelecimento compartilha com seus clientes.',
  },
  {
    q: 'Quanto custa e existe comissão por pedido?',
    a: `A assinatura custa R$ ${MENU_PLANS.monthly.label} por mês ou R$ ${MENU_PLANS.annual.label} por ano. A Konnexy Menu não cobra comissão sobre os pedidos. Consulte as condições de pagamento e ativação no painel.`,
  },
  {
    q: 'Como funciona o pedido pelo WhatsApp?',
    a: 'O cliente escolhe os produtos, informa quantidades e observações e seleciona mesa, retirada ou entrega. O cardápio prepara um resumo e abre o WhatsApp do estabelecimento; o cliente precisa confirmar o envio da mensagem. O atendimento combina a confirmação do pedido e o pagamento.',
  },
  {
    q: 'Como usar o QR Code nas mesas?',
    a: 'No painel administrativo, o estabelecimento pode gerar um QR Code geral ou vinculado ao número da mesa. Ao escanear o código com a câmera do celular, o cliente abre o cardápio no navegador, sem precisar baixar um aplicativo.',
  },
  {
    q: 'Posso atualizar preços, fotos e produtos?',
    a: 'Sim. Pelo painel administrativo, você pode cadastrar produtos e categorias, alterar preços, adicionar fotos e informações sobre ingredientes e marcar itens indisponíveis. Os clientes consultam o cardápio pelo mesmo link.',
  },
  {
    q: 'O cardápio funciona sem internet?',
    a: 'É necessária conexão para carregar informações atualizadas e enviar pedidos. O cardápio abre pelo navegador e pode ser adicionado à tela inicial nos dispositivos compatíveis, mas isso não garante funcionamento completo sem internet.',
  },
  {
    q: 'Posso ver uma demonstração antes de começar?',
    a: 'Sim. O botão “Explorar demonstração” abre um cardápio de exemplo para testar busca, filtros, detalhes dos produtos e carrinho. Os produtos e o restaurante dessa demonstração são fictícios.',
  },
] as const;
