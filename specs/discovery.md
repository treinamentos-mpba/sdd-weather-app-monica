# Discovery — Weather App

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para usuários que precisam consultar informações meteorológicas de cidades. O briefing estabelece cinco capacidades: buscar cidades, visualizar o clima atual, consultar a previsão de cinco dias, alternar entre Celsius e Fahrenheit e usar a aplicação em dispositivos móveis.

As decisões deste discovery fecham o escopo do MVP: Open-Meteo, busca manual por envio, previsão diária de hoje mais quatro dias no fuso local da cidade, interface pt-BR, unidade inicial Celsius e sem conta, localização automática, cache ou persistência em servidor.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para cinco dias da cidade selecionada.
- **RF-04 — Alternar unidades:** permitir alternar a exibição da temperatura entre Celsius e Fahrenheit.
- **RF-05 — Feedback de carregamento:** exibir um indicador ou mensagem enquanto a busca ou a consulta meteorológica estiver em andamento.
- **RF-06 — Feedback de erro:** informar quando a busca ou a consulta meteorológica falhar e indicar uma ação possível ao usuário.

## Requisitos Não-Funcionais

O briefing menciona explicitamente o uso em dispositivos móveis. Para o MVP, ficam adotados os seguintes critérios verificáveis:

- **RNF-01 — Responsividade:** todas as funções principais devem permanecer utilizáveis em viewports a partir de 320 CSS px, sem rolagem horizontal.
- **RNF-02 — Acessibilidade:** buscar conformidade com WCAG 2.2 nível AA; todas as funções devem ser operáveis por teclado e controles devem ter nomes acessíveis e foco visível.
- **RNF-03 — Desempenho:** com respostas da API simuladas, apresentar feedback visual em até 200 ms no p95; após a resposta simulada, atualizar a interface em até 500 ms no p95. A latência real do provedor é medida separadamente.
- **RNF-04 — Disponibilidade:** meta de 99,5% mensal para a aplicação, excluindo indisponibilidade confirmada do provedor externo e registrando-a separadamente.

Suporte: viewports de 320 CSS px ou maiores e versões estável atual e anterior de Chrome, Firefox, Safari e Edge. Acessibilidade: WCAG 2.2 AA como critério do MVP.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação proposta |
| --- | --- | --- | --- |
| Indisponibilidade ou lentidão da fonte de dados | Média | Alto: usuários podem não conseguir consultar as condições | Definir tratamento de erro e carregamento; avaliar limites e disponibilidade da fonte escolhida |
| Busca retornar cidades com nomes iguais ou resultados imprecisos | Média | Médio/alto: usuário pode consultar a localidade errada | Definir como os resultados serão diferenciados, por exemplo, com estado ou país |
| Previsão de cinco dias ser interpretada de formas diferentes | Média | Médio: dados apresentados podem não corresponder à expectativa | A decisão define hoje + quatro dias; ainda é necessário definir granularidade e fuso horário |
| Alternância de unidade produzir valores ou rótulos inconsistentes | Baixa/média | Médio: usuário pode interpretar incorretamente a temperatura | Definir o escopo da preferência e validar conversão, arredondamento e rótulos |
| Interface móvel dificultar leitura ou interação | Média | Alto: funcionalidades podem ficar inutilizáveis em telas pequenas | Definir requisitos responsivos e validar em dispositivos ou viewports móveis |

## Personas

As personas abaixo são hipóteses iniciais derivadas do briefing e ainda precisam ser validadas com usuários. As métricas são propostas, não metas aprovadas.

- **Pessoa em deslocamento diário:** quer consultar as condições atuais antes de sair. Contexto principal: celular, em consultas rápidas. Sucesso proposto: encontra a cidade correta e entende as condições atuais em até 30 segundos.
- **Pessoa planejando uma viagem:** quer consultar a previsão do destino para organizar os próximos dias. Contexto: desktop durante o planejamento e celular durante a viagem. Sucesso proposto: identifica a previsão dos cinco dias da cidade escolhida sem confundir localidade ou datas.
- **Pessoa habituada a Fahrenheit:** quer consultar temperaturas sem fazer conversões mentais. Contexto: celular ou desktop. Sucesso proposto: alterna para Fahrenheit e vê os valores de temperatura atuais e previstos com unidade consistente.

## Personas do MVP

Personas hipotéticas derivadas do briefing, usadas como perfis iniciais e não como pesquisa validada:

- **Pessoa em deslocamento diário:** consulta condições atuais no celular antes de sair; sucesso: encontra a cidade e entende as condições em até 30 segundos.
- **Pessoa planejando uma viagem:** usa desktop no planejamento e celular durante a viagem; sucesso: identifica a previsão das cinco datas da cidade selecionada.
- **Pessoa habituada a Fahrenheit:** usa celular ou desktop; sucesso: alterna para Fahrenheit e interpreta corretamente as temperaturas atuais e previstas.

## Perguntas de Discovery Resolvidas para o MVP

As perguntas abaixo foram respondidas pelas decisões numeradas nesta seção. Nenhuma delas bloqueia o início do desenvolvimento do MVP.

1. **A cobertura geográfica, frequência de atualização e disponibilidade do Open-Meteo atendem às necessidades do produto?**  
   Impacto: a fonte já foi escolhida, mas limitações de cobertura, atualização ou disponibilidade ainda podem afetar a qualidade do serviço.

2. **Como a busca deve funcionar: sugestões enquanto digita ou envio explícito?**  
   Impacto: influencia a interação, o volume de consultas e o comportamento esperado da interface.

3. **Como distinguir cidades com o mesmo nome?**  
   Impacto: sem contexto como estado ou país, o usuário pode selecionar a localidade incorreta.

4. **A previsão deve ser diária ou incluir horários específicos?**  
   Impacto: muda a quantidade de informação, a apresentação e possivelmente os dados necessários da API.

5. **Quais informações compõem “clima atual” e “previsão”?**  
   Impacto: sem uma lista definida, diferentes pessoas podem esperar temperatura, sensação térmica, precipitação, vento ou outras condições.

6. **A unidade escolhida pelo usuário deve persistir localmente entre visitas?**  
   Impacto: a decisão de não usar persistência de servidor não define se a preferência será salva no dispositivo ou reiniciada a cada visita.

7. **Geolocalização automática é esperada ou a cidade será sempre escolhida por busca?**  
   Impacto: afeta permissões, privacidade e o fluxo inicial do usuário.

8. **Como devem ser tratados fuso horário, formatos de data e hora e nomes de cidades?**  
   Impacto: a interface foi definida em pt-BR, mas datas e horários podem depender da localidade do usuário ou da cidade consultada.

9. **O que deve acontecer quando não houver conexão ou o provedor falhar?**  
   Impacto: define mensagens, possibilidade de nova tentativa e se dados em cache serão usados.

10. **Quais dispositivos, navegadores e tamanhos de tela devem ser suportados?**  
    Impacto: define a abrangência dos testes de compatibilidade e responsividade.

## Decisões

1. **Fonte de dados: Open-Meteo, sem API key.**  
   Justificativa: atende ao escopo sem exigir gestão de credenciais. Usar geocoding para busca e forecast para clima atual e previsão; apresentar atribuição “Dados meteorológicos: Open-Meteo”.

2. **“Cinco dias” significa hoje e os quatro dias seguintes.**  
   Justificativa: define um intervalo de cinco datas de calendário. A previsão é diária e usa o fuso local da cidade retornado pelo provedor.

3. **Unidade padrão: Celsius.**  
   Justificativa: estabelece um padrão inicial coerente com a interface em pt-BR, mantendo a alternância para Fahrenheit prevista no produto. Resolve a dúvida sobre a unidade inicial.

4. **Sem autenticação e sem persistência de servidor.**  
   Justificativa: mantém o MVP sem contas ou backend próprio. Não salvar buscas, cidades ou dados meteorológicos; salvar apenas a unidade no navegador.

5. **Idioma da interface: pt-BR.**  
   Justificativa: define textos, números e datas da interface em pt-BR; horários e datas seguem o fuso local da cidade consultada.

6. **Busca manual por envio explícito.**  
   A busca é enviada pelo botão ou pela tecla Enter; não há autocomplete. Espaços nas extremidades são removidos e campo vazio não envia requisição. Resultados mostram cidade, região administrativa e país quando disponíveis; sem resultados, a pessoa pode corrigir a busca.

7. **Dados exibidos no MVP.**  
   Clima atual: condição, temperatura, sensação térmica, umidade relativa, precipitação e velocidade do vento. Previsão diária: condição, mínima, máxima e probabilidade máxima de precipitação.

8. **Previsão e datas.**  
   A previsão é diária para hoje e os quatro dias seguintes. Usar fuso local da cidade retornado pelo provedor e exibir datas no formato pt-BR.

9. **Falhas e dados parciais.**  
   Timeout de 10 segundos por requisição, sem retentativa automática e sem cache. Falhas exibem erro e botão de nova tentativa manual. Campos ausentes são identificados como indisponíveis; nunca são substituídos por zero ou dados antigos.

10. **Localização e preferências.**  
   Não solicitar geolocalização automática. Salvar somente a unidade escolhida no armazenamento local do navegador; não salvar cidade, histórico ou consultas.

11. **Conectividade.**  
   O MVP requer conexão para buscar ou atualizar dados e não oferece modo offline.

12. **Compatibilidade.**  
   Suportar viewports a partir de 320 CSS px e as versões estável atual e anterior de Chrome, Firefox, Safari e Edge.

13. **Privacidade e provedor.**  
   Informar que o nome da cidade pesquisada é enviado ao Open-Meteo. Não enviar identificadores de usuário nem armazenar buscas no servidor. Exibir atribuição “Dados meteorológicos: Open-Meteo”.

14. **Critérios de qualidade.**  
   Adotar WCAG 2.2 AA; feedback visual em até 200 ms p95 e atualização da interface em até 500 ms p95 após resposta simulada do provedor; disponibilidade mensal de 99,5% para a aplicação, contabilizando separadamente indisponibilidade do provedor.

## Status de prontidão

As decisões acima fecham o escopo do MVP. Não há perguntas bloqueadoras para iniciar o desenvolvimento. Personas são hipóteses para orientar o primeiro ciclo e devem ser avaliadas em testes de usabilidade, sem bloquear a implementação.

## Suposições

- “Buscar cidades” significa que o usuário informa o nome de uma cidade e escolhe um resultado.
- Clima atual e previsão são apresentados para uma cidade selecionada.
- “Cinco dias” segue a decisão registrada acima: hoje e os quatro dias seguintes.
- Celsius é a unidade inicial; Fahrenheit permanece disponível pela alternância de unidades.
- Não se assume geolocalização automática nem modo offline. A única preferência persistida localmente é a unidade escolhida; cidade e histórico não são salvos.