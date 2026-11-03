# Análise do portfólio — portifolio-bay-zeta.vercel.app

**Skill da Lei de Hick:** não existe nenhuma no catálogo. Três buscas (hick, laws of ux, carga cognitiva) voltaram vazias. O princípio foi aplicado manualmente na seção 3.

**Limite:** a análise usou o texto, as cores e a estrutura retornados pelo Firecrawl. O screenshot não foi visualizado, então teclado, foco, tamanho de alvo de toque e animações precisam ser testados no navegador.

## 1. ux-copy

| Elemento | Hoje | Sugestão |
|---|---|---|
| Subtítulo do hero | "Em busca de crescimento profissional na área de T.I." | "Desenvolvedor júnior. Construo interfaces web com JavaScript, Tailwind e Java." |
| Título da aba | "PORTIFIOLIO_V1.0 // FULLSTACK_DEV" (com erro de digitação) | "Henrique Santana \| Desenvolvedor Júnior" |
| og:description | "Engenheiro e Desenvolvedor Fullstack..." | Descrever o que você é de fato: júnior, com projetos publicados |
| Botão do formulário | "ENVIAR TRANSMISSÃO" | "Enviar mensagem" |
| Botão dos projetos | "View Case" (inglês no meio do português) | "Ver projeto" |
| Rótulos | "Jornada_Log", "CONECTAR_LINK", "Legacy Nodes", "Status do Sistema: Ativo" | "Trajetória", "Contato", e remover os que não informam nada |
| SENAI | "Cursando" com "Status: Concluído" e fim em Abr 2026 | "Concluído" nos dois lugares |
| Card "Projeto Futuro" em Trabalhos_Recentes | Placeholder sem conteúdo | Manter o card e preenchê-lo com o site https://ember-music-five.vercel.app (EmberMusic): imagem, título, descrição e botão "Ver projeto" |

## 2. design-critique

- **Primeira impressão:** o nome em 96px chama a atenção, mas a frase abaixo não diz o que você faz. O seu melhor ativo (os projetos) só aparece depois de quatro seções.
- **Hierarquia:** as habilidades estão divididas em duas seções (Stack_Técnica e Habilidades_e_Ferramentas), e a trajetória não segue ordem cronológica (2023, 2022, 2024).
- **Consistência:** o site mistura português, inglês e jargão de terminal.
- **Credibilidade:** a descrição diz "Fullstack", mas a stack mostrada tem Java, SQL e HTML/CSS/JS, e os dois projetos são landing pages.
- **Funciona bem:** projetos com link ao vivo, currículo para baixar, contato direto e paleta coerente.

## 3. Lei de Hick (aplicada manualmente)

- Na primeira tela há cerca de 10 ações clicáveis: 6 itens de menu, GitHub, LinkedIn e 2 botões do hero. Dá para reduzir para 4 no menu (Projetos, Trajetória, Contato, Currículo) e 1 botão principal.
- Habilidades em duas seções obrigam a comparar 10 itens. Uma seção só resolve.
- O card "Projeto Futuro" de Trabalhos_Recentes deve ser mantido para receber o site https://ember-music-five.vercel.app (EmberMusic). Como placeholder ele é uma escolha sem valor; com o projeto real, a seção passa a mostrar 3 projetos.
- O rodapé "Legacy Nodes" tem 3 links que apontam para `#`. Remova ou ligue a algo real.
- O contato oferece e-mail, WhatsApp, currículo e formulário ao mesmo tempo. Destaque um caminho principal.

## 4. frontend-design

O visual atual (fundo preto, verde neon, bordas retas, rótulos em monospace e maiúsculas, "terminal") é justamente o padrão mais comum de portfólio gerado. Direção alternativa:

- **Conceito:** abrir com o trabalho, não com o nome. Coluna esquerda fixa com nome, uma frase e contato; coluna direita rolando os projetos com prévia ao vivo do site.
- **Cores:** fundo `#EDEFF2`, texto `#12141A`, destaque `#2B59FF`, superfície `#FFFFFF`, linha `#C9CED6`.
- **Tipografia:** uma família para títulos (Bricolage Grotesque) e uma para o corpo (Inter), sem monospace decorativo.
- **Movimento:** uma única animação de entrada. O resto só reage ao clique ou ao mouse.
- **O que foi revisado:** o plano inicial de "fundo escuro com um destaque vibrante" foi trocado porque repetiria o padrão atual.

## 5. accessibility-review (WCAG 2.1 AA)

**Contraste (calculado):**

| Par | Razão | Resultado |
|---|---|---|
| Texto `#E2E2E2` / `#000000` | 16,21:1 | Passa |
| Texto secundário `#B9CBB9` / `#000000` | 12,31:1 | Passa |
| Verde `#00FF87` / `#000000` | 15,65:1 | Passa |
| Botão primário `#00210C` / `#00FF87` | 12,80:1 | Passa |
| Borda do botão secundário `#3B4B3D` / `#000000` | 2,26:1 | Falha (mínimo 3:1, critério 1.4.11) |

**Outros achados:**

| # | Achado | Critério | Severidade |
|---|---|---|---|
| 1 | Nomes de ícones aparecem como texto no conteúdo ("keyboard_double_arrow_down", "rocket_launchschedule", "alternate_email"). Leitores de tela podem ler isso em voz alta; falta `aria-hidden` | 1.1.1 / 4.1.2 | 🟡 Maior |
| 2 | Conteúdo duplicado no carrossel/marquee sugere movimento automático; precisa de pausa | 2.2.2 | 🟡 Maior (verificar) |
| 3 | Links `#` sem destino no rodapé | 2.4.4 | 🟡 Maior |
| 4 | Texto do corpo em 14px monospace | 1.4.4 / legibilidade | 🟢 Menor |
| 5 | Foco visível, ordem de tabulação e alvos de 44px | 2.4.7 / 2.5.5 | Não verificado |
| 6 | Imagens dos projetos e ícones de tecnologia têm texto alternativo | 1.1.1 | Passa |

**Ordem de correção:** textos e título da aba (10 minutos), unificar habilidades e preencher o card "Projeto Futuro" com o EmberMusic, corrigir `aria-hidden` e os links `#`, e só depois o redesenho visual.