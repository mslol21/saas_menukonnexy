# Konnexy Menu — SEO, GEO e AEO

Revisão: 12/11/2026. Base: main `14d5bfe`.
Domínio canônico: https://menu.konnexy.com.br

## Diagnóstico confirmado

- Sitemap e robots apontavam para `konnexymenu.vercel.app`.
- Sitemap publicava fixtures de restaurantes e datas de atualização artificiais.
- Não havia canonical, metadados sociais completos nem representação estruturada do produto.
- Login e painéis herdavam os metadados comerciais e não declaravam noindex.
- Só a resposta aberta do FAQ era renderizada no HTML; as demais dependiam de JavaScript.
- Rodapé apresentava razão social, CPF e CEP sem documentação de confirmação no repositório. Foram removidos; não substituídos por outra localização presumida.

## Alterações

- Home com metadados próprios, canonical, Open Graph, Twitter e imagem PNG 1200 × 630 gerada pelo Next, sem dependência nova.
- Organization, WebSite, WebPage, SoftwareApplication/Offer e FAQPage relacionados por IDs consistentes; sem avaliações ou endereços inventados.
- FAQ sem dependência de JavaScript, com respostas explícitas sobre público, preço, WhatsApp, QR Code, atualização e limites de conexão.
- Preços atuais preservados: R$ 59,90/mês e R$ 599,90/ano; fonte única para interface, FAQ e ofertas estruturadas.
- Home identifica o produto no H1/texto inicial. Texto do hero permanece visível antes da hidratação.
- Sitemap contém apenas a home confirmada; não publica fixtures, painéis nem lastModified fictício.
- Login/admin/master: noindex na metadata e no cabeçalho HTTP. APIs: X-Robots-Tag. Robots permite leitura das páginas para que os buscadores vejam noindex; isso NÃO substitui autenticação.
- Deploys preview: metadata noindex e sitemap vazio. A produção precisa ser compilada com VERCEL_ENV=production; não promover um build preview sem recompilar.
- Cardápios: canonical próprio sem parâmetros de mesa; identidade obtida somente pela view pública `public_tenants`, com chave anônima, campos públicos explícitos e timeout de 2,5 s. Demonstrações e identidade não confirmada recebem noindex para não indexar o fallback fictício já existente na aplicação. Nenhuma alteração de tabela, RLS, credencial, pedido ou carrinho.

## Validação realizada antes da publicação

- `npm ci --no-audit --no-fund`: sucesso, lockfile preservado.
- `npm run build`: sucesso, Next 15.5.22, TypeScript validado, 14 páginas estáticas/rotas geradas.
- Home: First Load JS 156 kB; compartilhado 102 kB. Não é pontuação Lighthouse.
- HTML compilado: um H1; sete respostas completas; correspondência exata entre FAQ e JSON-LD; canonical e tags sociais corretos.
- HTML de login, admin e master: noindex/nofollow e sem canonical da home.
- Sitemap e robots gerados inspecionados; imagem validada como PNG 1200 × 630.
- Cenários com fixtures para metadata: restaurante público, demo, slug desconhecido, falha de rede, preview e escape de `</script>` no JSON-LD.
- Preview local indisponível: o serviço de preview injeta `--host`/`--strictPort`, incompatíveis com Next. Aplicação não foi modificada para contornar essa infraestrutura.

## Limites e acompanhamento

A renderização do conteúdo dos cardápios continua usando o fluxo cliente existente. A consulta de identidade pública foi validada com fixtures; não houve validação funcional de pedidos, pagamento, login real ou banco em produção nesta revisão. Se a view pública estiver ausente ou inacessível, o cardápio recebe noindex até a fonte pública ser confirmada. Para ampliar o sitemap com restaurantes reais, validar primeiro a publicação e disponibilidade de seus dados.

Não foi realizada medição Lighthouse, envio ao Search Console ou Rich Results Test. FAQPage descreve o conteúdo; não garante resultado enriquecido. SoftwareApplication não inclui avaliação fictícia para obter elegibilidade. SEO, GEO e AEO aqui significam conteúdo rastreável, claro, consistente e verificável, sem promessa de ranking ou citação por IA.

Após publicação: conferir HTTP/meta/robots/sitemap no domínio; enviar sitemap no Search Console quando houver acesso à propriedade e acompanhar indexação, impressões e cliques. Para avaliar IA, registrar consultas e citações observadas ao longo do tempo, sem confundir implementação com resultado de descoberta.

Referências oficiais:
- https://developers.google.com/search/docs/appearance/ai-features
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

## Verificação em produção

Commit de implementação: `9af24f99eea6b54a17c55d1d4172577b382d8eaf`.
Deploy Vercel: `dpl_4kisLAbebeccExz8PHntVRjdVyG5`, produção READY, alias `menu.konnexy.com.br` confirmado.

- HTTP 200 em home, robots, sitemap, login e demonstração.
- Home: index/follow, canonical no domínio oficial e JSON-LD presentes.
- Login: noindex/nofollow em HTML e X-Robots-Tag.
- Demonstração: noindex/nofollow e canonical próprio sem parâmetros.
- GET `/api/orders`: X-Robots-Tag noindex/nofollow; nenhuma escrita realizada.
- FAQ: expandir/recolher funcionou; tecla espaço recolheu a resposta selecionada.
- Alternância mensal atualizou preço para R$ 59,90/mês, preservando R$ 599,90/ano no seletor anual.
- Harness de QA separado incorporou a página real em iframe de 375, 768, 1024 e 1440 px. Em cada largura, scrollWidth igual à largura útil (descontada a barra vertical): sem overflow horizontal no documento. Alvos do FAQ medidos em 88 px no celular e 72 px nas larguras maiores. Isso não equivale a teste em quatro dispositivos físicos.
- Evidência visual: [FAQ publicado](review/konnexy-menu-seo.jpg).
