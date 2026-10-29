# Weather App — Product Specification

## Overview

**Status:** baseline do MVP pronto para desenvolvimento. As decisões são defaults fechados para esta entrega; mudanças exigem revisão de escopo.

O produto é uma aplicação web de previsão do tempo. Usuários poderão buscar uma cidade, consultar seu clima atual e uma previsão de cinco dias, além de alternar a temperatura entre Celsius e Fahrenheit. A interface será em pt-BR e deverá funcionar em dispositivos móveis e desktop.

Decisões do MVP: usar Open-Meteo sem API key; busca manual por envio; previsão diária de hoje e dos quatro dias seguintes no fuso local da cidade; iniciar em Celsius; salvar somente a unidade no navegador; sem conta, localização automática, cache ou persistência em servidor. A interface e os dados são apresentados em pt-BR.

O objetivo é permitir que a pessoa consulte rapidamente informações meteorológicas de uma localidade escolhida. As personas no discovery são hipóteses para orientar o MVP, não pesquisa validada.

## Functional Requirements

- **FR-01 — Buscar cidade:** aceitar nome de cidade por envio do botão ou tecla Enter, removendo espaços externos. Input vazio não envia solicitação. Exibir resultados com cidade, região administrativa e país quando disponíveis; a pessoa seleciona um resultado antes da consulta meteorológica.
- **FR-02 — Exibir clima atual:** para a cidade selecionada, exibir condição meteorológica, temperatura, sensação térmica, umidade relativa, precipitação, velocidade do vento e pressão atmosférica. Campos ausentes seguem AC-02b.
- **FR-03 — Exibir previsão:** apresentar previsão diária para hoje e os quatro dias seguintes, no fuso local da cidade, com condição, temperaturas mínima e máxima e probabilidade máxima de precipitação.
- **FR-04 — Alternar unidade:** permitir alternar todas as temperaturas exibidas entre Celsius e Fahrenheit. Iniciar em Celsius e salvar a preferência somente no armazenamento local do navegador.
- **FR-05 — Exibir carregamento:** mostrar estado visual durante cada busca ou consulta pendente e removê-lo quando a solicitação terminar.
- **FR-06 — Exibir e recuperar falhas:** em erro de rede, timeout ou erro do provedor, mostrar mensagem e permitir nova tentativa manual da mesma operação. Usar timeout de 10 segundos; não fazer retentativa automática nem cache.

## User Stories

- **US-01 (FR-01):** Como pessoa em deslocamento diário, quero buscar e selecionar a cidade correta para consultar o clima da minha localidade.
- **US-02 (FR-02):** Como pessoa em deslocamento diário, quero ver as condições atuais da cidade selecionada para entender o clima antes de sair.
- **US-03 (FR-03):** Como pessoa planejando uma viagem, quero consultar a previsão de hoje e dos quatro dias seguintes para organizar meus próximos dias no destino.
- **US-04 (FR-04):** Como pessoa habituada a Fahrenheit, quero alternar as temperaturas para Fahrenheit para interpretá-las sem conversão mental.
- **US-05 (FR-05):** Como pessoa planejando uma viagem, quero ver quando a consulta está carregando para saber que minha solicitação está sendo processada.
- **US-06 (FR-06):** Como pessoa em deslocamento diário, quero receber uma mensagem quando a consulta falhar e ver uma ação possível para saber como prosseguir.

As personas são hipóteses iniciais registradas em `specs/discovery.md` e ainda precisam ser validadas com usuários.

## Acceptance Criteria

- **AC-01 (FR-01)**
- **Given:** a pessoa informa um nome de cidade com pelo menos um caractere não branco, incluindo acentos ou caracteres Unicode válidos.
- **When:** a busca é enviada.
- **Then:** espaços em branco nas extremidades são removidos e a busca é enviada uma vez; nenhum caractere válido do nome é descartado.
- **Given:** o campo de busca está vazio ou contém apenas espaços em branco.
- **When:** a pessoa tenta enviar a busca.
- **Then:** nenhuma solicitação de geocoding é enviada e a interface solicita um nome de cidade.
- **Given:** o geocoding retorna uma lista vazia.
- **When:** a resposta é apresentada.
- **Then:** a interface informa que nenhuma cidade foi encontrada, mantém o valor pesquisado disponível para edição e não solicita dados meteorológicos.
- **Given:** o geocoding retorna um ou mais resultados.
- **When:** a pessoa seleciona um resultado.
- **Then:** a interface identifica a localidade selecionada e as consultas meteorológicas seguintes usam o identificador ou as coordenadas desse resultado, não apenas o texto digitado.
- **Given:** o geocoding retorna localidades homônimas.
- **When:** os resultados são exibidos.
- **Then:** cada opção inclui nome da cidade, região administrativa e país quando disponíveis.
- **AC-02 (FR-02)**
- **Given:** há uma localidade selecionada e uma resposta controlada contém condição, temperatura, sensação térmica, umidade relativa, precipitação, velocidade do vento e pressão atmosférica.
- **When:** a consulta termina com sucesso.
- **Then:** a interface identifica a localidade e exibe cada campo com o valor correspondente da resposta, sem associar dados de outra localidade.
- **AC-02b (FR-02)**
- **Given:** a resposta de clima atual contém alguns campos e omite pelo menos um dos campos definidos para o MVP.
- **When:** a resposta é apresentada.
- **Then:** os campos presentes são exibidos; campos omitidos e valores nulos aparecem como “Indisponível”, exceto `current.precipitation` explicitamente nulo, que é normalizado para `0 mm`. Nunca reutilizar valores antigos.
- **AC-03 (FR-03)**
- **Given:** há uma localidade selecionada e uma resposta controlada contém previsão diária para hoje e os quatro dias seguintes no fuso local da cidade.
- **When:** a consulta de previsão termina com sucesso.
- **Then:** a interface exibe cinco itens em ordem cronológica, identifica cada data em pt-BR e mostra condição, mínima, máxima e probabilidade máxima de precipitação em cada item.
- **AC-04 (FR-04)**
- **Given:** as temperaturas visíveis incluem 0 °C e 20 °C, e a unidade inicial está em Celsius.
- **When:** a pessoa seleciona Fahrenheit.
- **Then:** os valores correspondentes passam a 32 °F e 68 °F, com rótulos °F; ao selecionar Celsius, voltam a 0 °C e 20 °C, com rótulos °C. Todas as temperaturas visíveis seguem essa regra, e Fahrenheit continua selecionado após recarregar a página no mesmo navegador.
- **AC-05 (FR-05)**
- **Given:** uma busca ou consulta controlada permanece pendente.
- **When:** a interface renderiza o estado da solicitação.
- **Then:** um indicador ou mensagem de carregamento está visível; quando a solicitação termina com sucesso ou falha, o indicador deixa de estar visível.
- **AC-06 (FR-06)**
- **Given:** uma busca ou consulta controlada termina com falha de rede, timeout de 10 segundos ou erro do provedor.
- **When:** a falha é apresentada.
- **Then:** o indicador de carregamento desaparece, uma mensagem de erro é exibida e a ação “Tentar novamente” está disponível.
- **Given:** a mensagem de erro e a ação “Tentar novamente” estão visíveis.
- **When:** a pessoa aciona a ação.
- **Then:** a mesma busca ou consulta é reenviada uma vez e o estado de carregamento volta a ser apresentado enquanto aguarda resposta.

## Matriz de Rastreabilidade

| User Story | Requisito | Critérios de aceite | NFRs relevantes |
|---|---|---|---|
| US-01 — Buscar e selecionar uma cidade | FR-01 | AC-01 | NFR-01 responsividade, NFR-02 acessibilidade, NFR-03 desempenho, NFR-05 idioma |
| US-02 — Consultar o clima atual | FR-02 | AC-02, AC-02b | NFR-01 responsividade, NFR-02 acessibilidade, NFR-03 desempenho, NFR-04 disponibilidade, NFR-05 idioma |
| US-03 — Consultar a previsão de cinco dias | FR-03 | AC-03 | NFR-01 responsividade, NFR-02 acessibilidade, NFR-03 desempenho, NFR-04 disponibilidade, NFR-05 idioma |
| US-04 — Alternar para Fahrenheit | FR-04 | AC-04 | NFR-01 responsividade, NFR-02 acessibilidade, NFR-05 idioma |
| US-05 — Perceber que a consulta está carregando | FR-05 | AC-05 | NFR-01 responsividade, NFR-02 acessibilidade, NFR-03 desempenho, NFR-05 idioma |
| US-06 — Receber orientação quando uma consulta falha | FR-06 | AC-06 | NFR-01 responsividade, NFR-02 acessibilidade, NFR-03 desempenho, NFR-04 disponibilidade, NFR-05 idioma |

## Non-Functional Requirements

Os valores de desempenho, disponibilidade, responsividade e acessibilidade abaixo são propostas herdadas do discovery, ainda sujeitas à aprovação dos stakeholders. Não devem ser tratados como metas contratuais até que o método de medição e o escopo sejam acordados.

- **NFR-01 — Responsiveness (proposta):** nos viewports de 320, 375, 768 e 1280 CSS px, as funções principais devem ser utilizáveis sem rolagem horizontal nem controles cortados.
- **NFR-02 — Accessibility (proposta):** buscar conformidade com WCAG 2.2 nível AA. Validar operação integral por teclado, ordem de foco, foco visível, nomes acessíveis e anúncios de loading/erro por tecnologia assistiva.
- **NFR-03 — Performance (proposta):** em teste com respostas do provedor simuladas, feedback visual deve ocorrer em até 200 ms no p95; após a resposta simulada, a atualização da interface deve ocorrer em até 500 ms no p95. Latência real do provedor deve ser medida separadamente. Ambiente e método de medição precisam de aprovação.
- **NFR-04 — Availability (proposta):** meta de 99,5% de disponibilidade mensal para a aplicação. Definir monitoramento, janela de medição, exclusões e como indisponibilidade do provedor será reportada antes de aprovar a meta.
- **NFR-05 — Interface language:** textos da interface devem estar em pt-BR. Datas, horários, números e localização dos nomes de cidades devem seguir regras aprovadas em OQ-04.

## Edge Cases

- **Campo vazio ou só com espaços:** não enviar geocoding; solicitar o nome da cidade (AC-01).
- **Cidade inexistente ou geocoding sem resultados:** mostrar estado “Nenhuma cidade encontrada”, permitir editar a busca e não iniciar consulta meteorológica (AC-01).
- **Nome com Unicode, acentos, hífen ou apóstrofo:** preservar o nome na busca e na identificação do resultado; a busca não deve falhar apenas por esses caracteres (AC-01).
- **Cidades homônimas:** exigir seleção de um resultado identificado com contexto regional; os campos de desambiguação são definidos em OQ-01.
- **Erro de rede ou provedor:** remover loading, mostrar erro e permitir nova tentativa manual (AC-06).
- **Timeout:** tratar como falha, encerrar loading e oferecer nova tentativa; duração do timeout permanece em OQ-06.
- **Resposta parcial:** exibir os campos presentes e identificar campos omitidos/nulos como “Indisponível”; `current.precipitation: null` é a exceção e representa `0 mm` (AC-02b). Nunca reutilizar dados antigos.
- **Mudança de dia ou fuso horário:** não atribuir datas até que a regra de fuso de OQ-04 seja aprovada.
- **Alternância de unidade durante carregamento ou após nova consulta:** aplicar a unidade selecionada a todas as temperaturas visíveis, inclusive após a resposta seguinte.
- **Cidade com nome longo em viewport estreita:** manter o nome identificável e os controles utilizáveis, conforme NFR-01.

## Assumptions

- A pessoa informa o nome de uma cidade e seleciona um resultado; geolocalização automática não é assumida.
- Clima atual e previsão correspondem à localidade selecionada.
- Celsius é a unidade inicial, e Fahrenheit permanece disponível pela alternância.
- O período de previsão é hoje mais os quatro dias seguintes.
- Open-Meteo é a fonte de dados escolhida e não requer API key para o escopo previsto.
- A aplicação não terá autenticação nem persistência de servidor.
- Não se assume persistência local da unidade nem suporte offline.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Cobertura, limites ou disponibilidade do Open-Meteo não atenderem ao produto | Média | Alto: consultas podem falhar ou não cobrir a cidade desejada | Verificar cobertura, limites, atualização e atribuição exigida antes de fechar o plano técnico. |
| Resultados de busca ambíguos ou imprecisos | Média | Alto: a pessoa pode consultar a localidade errada | Definir critérios de correspondência e contexto de desambiguação antes de aprovar FR-01. |
| Granularidade ou datas da previsão divergirem da expectativa | Média | Médio/alto: a previsão pode ser insuficiente ou interpretada incorretamente | Resolver OQ-02 e OQ-04 e validar os critérios de aceite com stakeholders. |
| Unidades inconsistentes ou conversão incorreta | Baixa/média | Alto: valores meteorológicos podem ser mal interpretados | Aplicar a unidade selecionada de forma consistente e incluir testes para conversão e rótulos. |
| Falhas da API sem recuperação clara | Média | Alto: a pessoa pode ficar sem dados ou sem saber como prosseguir | Definir timeout, nova tentativa, cache e mensagens de erro em OQ-06. |
| Experiência inacessível ou inadequada em telas pequenas | Média | Alto: funções principais podem não ser utilizáveis por parte do público | Aprovar os RNFs e validar teclado, tecnologias assistivas e viewports definidos. |

## Out of Scope

- Autenticação e contas de usuário.
- Persistência de dados em servidor.
- Funcionalidades não requeridas no briefing, como alertas meteorológicos, notificações, histórico ou lista de cidades salvas, salvo aprovação explícita de mudança de escopo.
- Geolocalização automática, persistência local de preferências e funcionamento offline não estão assumidos como funcionalidades. Sua inclusão ou exclusão definitiva deve ser registrada ao responder às perguntas em aberto correspondentes.

## Open Questions

### Bloqueiam critérios de aceite completos

- **OQ-01 — Busca:** aprovar busca por envio explícito ou sugestões; definir contexto de desambiguação (proposta: cidade, região e país) e confirmar os estados de input vazio e zero resultados descritos em AC-01.
- **OQ-02 — Granularidade da previsão:** os campos de clima atual e previsão estão listados em FR-02/FR-03; confirmar se a previsão diária atende ao MVP ou se dados horários serão necessários.
- **OQ-03 — Personas e sucesso:** as personas e métricas propostas em `specs/discovery.md` representam os usuários prioritários? Como validar os objetivos e definir métricas de sucesso adequadas?
- **OQ-04 — Datas e fuso horário:** aprovar o fuso local da cidade como referência (proposta) ou outro referencial, e definir formatos de data e hora em pt-BR.
- **OQ-05 — Contrato do provedor:** a cobertura e frequência de atualização do Open-Meteo são suficientes? Quais endpoints, unidades, limites e exigências de atribuição serão adotados?
- **OQ-06 — Falhas e resiliência:** definir duração do timeout, política de retentativa automática e uso/validade de cache. A recuperação manual de uma falha já está definida em AC-06.

### Podem ser adiadas se ficarem explicitamente fora do MVP

- **OQ-07 — Preferência local:** a unidade escolhida será salva localmente entre visitas ou voltará ao padrão Celsius?
- **OQ-08 — Geolocalização:** o produto deve solicitar localização automática ou depender exclusivamente de busca manual?
- **OQ-09 — Offline:** o app deve funcionar sem conexão ou apenas informar a indisponibilidade sem exibir dados em cache?
- **OQ-10 — Compatibilidade e validação dos NFRs:** quais navegadores e dispositivos serão suportados? Aprovar os limites propostos de desempenho, disponibilidade, viewport e acessibilidade e definir ambiente, método e responsável pela medição.