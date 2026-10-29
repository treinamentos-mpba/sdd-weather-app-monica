# Backlog de Tarefas — Weather App

## Premissas

O backlog segue a arquitetura de `plans/weather-app-plan.md`. A ordem é: tipos → funções puras → services → hook → componentes → integração → testes → hardening. A spec ainda contém OQs sobre busca, campos/granularidade, fuso, persistência da unidade e tratamento de falhas; alinhar essas decisões antes de tratar critérios associados como gate de release. Não incluir autenticação, cache, modo offline ou localização automática neste MVP.

## Entrega 1 — Tipos

### T-01 — Definir os tipos de domínio

- **Descrição:** declarar os contratos TypeScript compartilhados para cidade, clima, previsão, snapshot e unidade.
- **Tipo:** Data
- **Requisitos:** FR-01 a FR-04; AC-01, AC-02, AC-02b, AC-03 e AC-04.
- **Critérios de aceite:**
  - `City` contém nome e coordenadas obrigatórios, timezone e campos opcionais de identificação/região.
  - `CurrentWeather` e `DailyForecast` representam os campos do plano, incluindo `surfacePressureHpa`; valores meteorológicos ausentes são `null`.
  - `TemperatureUnit` é exatamente `"celsius" | "fahrenheit"`; `WeatherSnapshot` contém cidade, clima atual e forecast.
  - `pnpm build` passa sem `any` nos contratos criados.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.

## Entrega 2 — Funções puras

### T-02 — Implementar conversão de temperatura

- **Descrição:** criar conversão pura Celsius/Fahrenheit para a apresentação.
- **Tipo:** Data
- **Requisitos:** FR-04; AC-04.
- **Critérios de aceite:**
  - A fórmula é `F = C * 9 / 5 + 32`: 0 °C resulta em 32 °F, 20 °C em 68 °F e 10,5 °C em 50,9 °F antes da formatação.
  - `null` permanece `null`; arredondamento fica a cargo da formatação.
  - A função não acessa API, storage ou estado React.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.

### T-03 — Implementar mapeamento de códigos WMO

- **Descrição:** mapear códigos meteorológicos para descrições de interface.
- **Tipo:** Data
- **Requisitos:** FR-02, FR-03; AC-02, AC-03.
- **Critérios de aceite:**
  - WMO 0 retorna “Céu limpo” e WMO 61 retorna “Chuva fraca”.
  - WMO 999 retorna “Condição desconhecida” sem lançar exceção.
  - A função é pura e não acessa rede ou estado React.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.

### T-04 — Implementar formatação pt-BR

- **Descrição:** criar funções puras para datas, números e valores ausentes.
- **Tipo:** Data
- **Requisitos:** FR-02, FR-03; AC-02, AC-03; NFR-05.
- **Critérios de aceite:**
  - Data `2026-10-29` no timezone `Europe/Lisbon` é exibida como `29/10/2026`.
  - Número `1234.5` é exibido como `1.234,5` usando locale pt-BR.
  - `null` é exibido como “Indisponível”, nunca como zero.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`.

## Entrega 3 — Services

### T-05 — Implementar geocoding de cidades

- **Descrição:** criar a chamada de busca à Open-Meteo e mapear respostas para `City`.
- **Tipo:** Data
- **Requisitos:** FR-01; AC-01.
- **Critérios de aceite:**
  - Para query `Lisboa`, envia `name=Lisboa`, `count=10`, `language=pt`, `format=json`.
  - Mapeia `id`, `name`, `admin1`, `country`, `latitude`, `longitude` e `timezone`; campos opcionais ausentes não impedem o resultado.
  - `results: []` retorna coleção vazia; HTTP não-2xx e erro de rede retornam erros tipados.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.

### T-06 — Implementar consulta de clima e previsão

- **Descrição:** consultar forecast para a cidade selecionada e normalizar para `WeatherSnapshot`.
- **Tipo:** Data
- **Requisitos:** FR-02, FR-03; AC-02, AC-02b, AC-03.
- **Critérios de aceite:**
  - Envia latitude/longitude, `timezone=auto`, `forecast_days=5`, Celsius, mm e km/h.
  - `current` solicita `temperature_2m`, `apparent_temperature`, `relative_humidity_2m`, `precipitation`, `weather_code`, `wind_speed_10m` e `surface_pressure`.
  - `daily` solicita `weather_code`, `temperature_2m_min`, `temperature_2m_max` e `precipitation_probability_max`.
  - Cria cinco `DailyForecast` por índice dos arrays diários, em ordem cronológica e com data local.
  - Campos atuais/daily ausentes viram `null`, exceto `current.precipitation: null`, que vira `0`; JSON incompatível vira `invalid-response`.
- **Dependências:** T-01, T-05.
- **Arquivos prováveis:** `src/services/weatherService.ts`.

## Entrega 4 — Hook e estado

### T-07 — Implementar o hook de busca e estado meteorológico

- **Descrição:** orquestrar geocoding, seleção, forecast, estado de loading/vazio/erro, timeout e retry manual.
- **Tipo:** UI
- **Requisitos:** FR-01 a FR-06; AC-01 a AC-06.
- **Critérios de aceite:**
  - Busca e clima têm estados independentes `idle`, `loading`, `success`, `empty` e `error`.
  - Input vazio resulta em zero chamadas ao geocoding; selecionar cidade resulta em uma chamada de forecast com suas coordenadas.
  - Timeout de 10 segundos aborta; retry manual inicia exatamente uma nova tentativa.
  - Resposta de requisição substituída não altera a query/cidade/snapshot mais recentes nem exibe erro de cancelamento.
  - Sem unidade salva, começa em Celsius; falha de `localStorage` não impede a mudança de unidade em memória.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.

## Entrega 5 — Componentes

### T-08 — Construir input de busca

- **Descrição:** criar campo de busca e submissão por botão/Enter.
- **Tipo:** UI
- **Requisitos:** FR-01; AC-01; NFR-02.
- **Critérios de aceite:**
  - Input vazio/whitespace não chama submit; `  Lisboa  ` envia `Lisboa`.
  - Campo tem label acessível e funciona por teclado.
  - Componente recebe valor/callbacks por props e não chama service.
- **Dependências:** T-01, T-07.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.

### T-09 — Construir resultados e seleção de cidades

- **Descrição:** exibir resultados de geocoding e permitir selecionar a cidade correta.
- **Tipo:** UI
- **Requisitos:** FR-01; AC-01; NFR-02.
- **Critérios de aceite:**
  - Cada resultado mostra cidade e, se disponíveis, região e país.
  - Selecionar resultado chama callback uma vez com o objeto `City`, incluindo coordenadas.
  - Resultados são identificáveis por role e selecionáveis por teclado.
- **Dependências:** T-01, T-05, T-08.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.

### T-10 — Exibir clima atual

- **Descrição:** criar apresentação do clima atual.
- **Tipo:** UI
- **Requisitos:** FR-02; AC-02, AC-02b; NFR-01, NFR-02, NFR-05.
- **Critérios de aceite:**
  - Fixture exibe os sete campos atuais, incluindo pressão em hPa, e o nome da cidade selecionada.
  - Cada campo `null` aparece como “Indisponível”; não aparece zero nem dado anterior.
  - Recebe dados por props e não chama `fetch`.
- **Dependências:** T-01, T-03, T-04, T-06, T-07.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.

### T-11 — Exibir cartão de previsão diária

- **Descrição:** criar a apresentação de um único dia da previsão.
- **Tipo:** UI
- **Requisitos:** FR-03; AC-03; NFR-02, NFR-05.
- **Critérios de aceite:**
  - Um `DailyForecast` exibe data, condição, mínima, máxima e probabilidade máxima.
  - Data/valores são formatados por funções pt-BR; valores ausentes usam “Indisponível”.
  - Componente recebe dados por props e não chama `fetch`.
- **Dependências:** T-01, T-03, T-04.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.

### T-12 — Exibir lista de cinco dias

- **Descrição:** renderizar os cartões de previsão diária em ordem.
- **Tipo:** UI
- **Requisitos:** FR-03; AC-03; NFR-01.
- **Critérios de aceite:**
  - Uma fixture de cinco dias produz exatamente cinco cartões em ordem cronológica.
  - Componente não faz requisições e encaminha cada item ao cartão correspondente.
- **Dependências:** T-11.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.

### T-13 — Apresentar estado de carregamento

- **Descrição:** criar indicador visual e acessível para operação pendente.
- **Tipo:** UI
- **Requisitos:** FR-05; AC-05; NFR-02.
- **Critérios de aceite:**
  - Com status `loading`, há exatamente um indicador visível com role `status` e texto acessível.
  - Com `idle`, `success`, `empty` ou `error`, indicador não está visível.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.

### T-14 — Apresentar estado vazio

- **Descrição:** criar estado visual para geocoding vazio e forecast sem dados utilizáveis.
- **Tipo:** UI
- **Requisitos:** FR-01; AC-01. Forecast vazio é definido pelo plano.
- **Critérios de aceite:**
  - `results: []` exibe “Nenhuma cidade encontrada” e mantém a busca editável.
  - Forecast `empty` exibe “Dados meteorológicos indisponíveis” e não mostra snapshot anterior.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.

### T-15 — Apresentar estado de erro e retry

- **Descrição:** criar mensagem de erro e ação acessível para retry.
- **Tipo:** UI
- **Requisitos:** FR-06; AC-06; NFR-02.
- **Critérios de aceite:**
  - Estado `error` mostra mensagem e botão “Tentar novamente”; outros estados não mostram o botão.
  - Mensagem usa role `alert`; acionar o botão chama o callback exatamente uma vez.
- **Dependências:** T-01, T-07.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.

### T-16 — Implementar controle de unidade

- **Descrição:** criar alternância Celsius/Fahrenheit ligada ao estado de unidade.
- **Tipo:** UI
- **Requisitos:** FR-04; AC-04; NFR-02.
- **Critérios de aceite:**
  - A unidade inicial apresentada é Celsius; alternar chama callback com Fahrenheit e depois Celsius.
  - Controle tem nome acessível e funciona por teclado.
- **Dependências:** T-01, T-02, T-07.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.

## Entrega 6 — Integração da aplicação

### T-17 — Preparar entrada, estilos e composição da tela

- **Descrição:** montar a aplicação React, importar estilos globais e conectar hook e componentes.
- **Tipo:** Infra
- **Requisitos:** FR-01 a FR-06; AC-01 a AC-06; NFR-01, NFR-02, NFR-05.
- **Critérios de aceite:**
  - `main.tsx` monta `App` em `#root` e importa `index.css`; `App` conecta os callbacks do hook aos componentes.
  - Busca, seleção, unidade, loading, vazio e erro seguem os estados fornecidos pelo hook; componentes não chamam services.
  - `pnpm dev` e `pnpm build` completam sem erro.
- **Dependências:** T-07 a T-16.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`.

## Entrega 7 — Testes

### T-18 — Testar conversão de temperatura

- **Descrição:** validar conversão Celsius/Fahrenheit com Vitest.
- **Tipo:** Test
- **Requisitos:** FR-04; AC-04.
- **Critérios de aceite:**
  - Testes verificam 0 °C → 32 °F, 20 °C → 68 °F, 10,5 °C → 50,9 °F e `null` → `null`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.

### T-19 — Testar códigos WMO

- **Descrição:** testar códigos mapeados e desconhecidos com Vitest.
- **Tipo:** Test
- **Requisitos:** FR-02, FR-03; AC-02, AC-03.
- **Critérios de aceite:**
  - WMO 0 retorna “Céu limpo”, WMO 61 retorna “Chuva fraca” e WMO 999 retorna “Condição desconhecida”.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.

### T-20 — Testar formatação pt-BR

- **Descrição:** testar formatação de datas, números e dados ausentes.
- **Tipo:** Test
- **Requisitos:** FR-02, FR-03; AC-02, AC-03; NFR-05.
- **Critérios de aceite:**
  - `2026-10-29` em `Europe/Lisbon` resulta em `29/10/2026`; `1234.5` resulta em `1.234,5`.
  - `null` resulta em “Indisponível”.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.

### T-21 — Testar serviços da Open-Meteo

- **Descrição:** cobrir geocoding, forecast, mapeamento e falhas com `fetch` mockado.
- **Tipo:** Test
- **Requisitos:** FR-01, FR-02, FR-03, FR-06; AC-01, AC-02, AC-02b, AC-03, AC-06.
- **Critérios de aceite:**
  - Fixtures verificam parâmetros, geocoding `Lisboa`, lista vazia e forecast com cinco datas completas/parciais.
  - HTTP 500 produz `kind: "api"` com status 500; JSON inválido produz `invalid-response`; rejeição `fetch` produz `network`.
  - Nenhum teste chama API real.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.

### T-22 — Testar hook e estados assíncronos

- **Descrição:** testar transições do hook, timeout, retry, unidade e concorrência.
- **Tipo:** Test
- **Requisitos:** FR-01 a FR-06; AC-01 a AC-06.
- **Critérios de aceite:**
  - Testes verificam transições `idle → loading → success`, `loading → empty`, `loading → error` e `error → loading`.
  - Fake timers em 10.000 ms produzem timeout; retry inicia exatamente uma nova chamada.
  - Resposta obsoleta não substitui query/cidade/snapshot atual; sem unidade salva, início é Celsius.
  - Services são mockados; nenhuma chamada de rede real ocorre.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.

### T-23 — Testar input e seleção de cidades

- **Descrição:** testar submissão, resultado e seleção com Testing Library.
- **Tipo:** Test
- **Requisitos:** FR-01; AC-01; NFR-02.
- **Critérios de aceite:**
  - Input vazio chama submit zero vezes; `  Lisboa  ` envia `Lisboa` uma vez.
  - Seleção chama callback uma vez com objeto `City` e coordenadas fixture.
  - Busca é encontrada por label e resultado por role acessível.
- **Dependências:** T-08, T-09.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/CityResults.test.tsx`.

### T-24 — Testar apresentação do clima atual

- **Descrição:** testar os campos do clima e resposta parcial do componente.
- **Tipo:** Test
- **Requisitos:** FR-02; AC-02, AC-02b.
- **Critérios de aceite:**
  - Fixture renderiza os sete campos do AC-02, incluindo pressão em hPa, e a cidade selecionada.
  - Campos `null` aparecem como “Indisponível”, exceto precipitação atual, que o service normaliza para `0 mm`; nenhum campo usa dado anterior.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`.

### T-25 — Testar apresentação da previsão

- **Descrição:** testar quantidade, ordem e campos dos cartões diários.
- **Tipo:** Test
- **Requisitos:** FR-03; AC-03.
- **Critérios de aceite:**
  - Fixture de cinco datas produz exatamente cinco itens na ordem fornecida.
  - Cada item mostra condição, mínima, máxima e probabilidade máxima correspondentes ao índice.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`.

### T-26 — Testar estado de carregamento

- **Descrição:** verificar estado visível e anúncio acessível durante operações.
- **Tipo:** Test
- **Requisitos:** FR-05; AC-05; NFR-02.
- **Critérios de aceite:**
  - `role="status"` está visível durante loading e ausente em idle/success/empty/error.
  - O status contém texto acessível não vazio.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/LoadingState.test.tsx`.

### T-27 — Testar estado vazio

- **Descrição:** testar estado vazio de busca e forecast.
- **Tipo:** Test
- **Requisitos:** FR-01; AC-01. Forecast vazio segue estado definido no plano.
- **Critérios de aceite:**
  - `results: []` mostra “Nenhuma cidade encontrada” e preserva input editável.
  - Forecast `empty` mostra “Dados meteorológicos indisponíveis” e não mostra snapshot anterior.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/EmptyState.test.tsx`.

### T-28 — Testar estado de erro e retry

- **Descrição:** testar mensagem, acessibilidade e callback de recuperação.
- **Tipo:** Test
- **Requisitos:** FR-06; AC-06; NFR-02.
- **Critérios de aceite:**
  - Erro usa `role="alert"`; botão “Tentar novamente” é encontrado por role/nome.
  - Um clique chama callback exatamente uma vez.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/unit/ErrorState.test.tsx`.

### T-29 — Testar alternância de unidade

- **Descrição:** testar controle da unidade e interação por teclado.
- **Tipo:** Test
- **Requisitos:** FR-04; AC-04; NFR-02.
- **Critérios de aceite:**
  - Unidade inicial é Celsius; alternar e voltar chama callback com Fahrenheit e depois Celsius.
  - Interação não invoca serviço nem altera snapshot Celsius fornecido.
  - Controle é acessível por label/role e teclado.
- **Dependências:** T-16.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.

### T-30 — Testar fluxo E2E de consulta bem-sucedida

- **Descrição:** testar busca, seleção, dados atuais, forecast e unidade no navegador.
- **Tipo:** Test
- **Requisitos:** FR-01 a FR-04; AC-01 a AC-04; NFR-01, NFR-02.
- **Critérios de aceite:**
  - `page.route` intercepta geocoding/forecast; nenhuma chamada chega à API real.
  - Após selecionar cidade fixture, os sete campos atuais e cinco cartões ficam visíveis.
  - Alternar unidade não aumenta contagem de chamadas forecast.
  - Nos viewports 320, 375, 768 e 1280 CSS px, `scrollWidth <= clientWidth` e o fluxo funciona por teclado.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.

### T-31 — Testar estados vazios e falhas E2E

- **Descrição:** testar busca vazia de resultados, erro recuperável e retry no navegador.
- **Tipo:** Test
- **Requisitos:** FR-01, FR-05, FR-06; AC-01, AC-05, AC-06.
- **Critérios de aceite:**
  - Geocoding `results: []` mostra “Nenhuma cidade encontrada” e gera zero chamadas forecast.
  - Erro HTTP mostra loading encerrado e retry; clicar retry inicia uma chamada e fixture de sucesso atualiza a tela.
  - Todas as chamadas são interceptadas por `page.route`; timeout é verificado com fake timers em T-22.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`.

## Entrega 8 — Hardening

### T-32 — Verificar qualidade de release e NFRs aprovados

- **Descrição:** executar os gates obrigatórios de qualidade antes da entrega.
- **Tipo:** Infra
- **Requisitos:** NFR-01, NFR-02; gates do projeto.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` passam.
  - Playwright passa nos quatro viewports definidos em NFR-01.
  - Teclado, foco e anúncios de loading/erro são verificados conforme NFR-02.
- **Dependências:** T-18 a T-31.
- **Arquivos prováveis:** arquivos de teste afetados e, se necessário, `.github/workflows/*`.

### T-33 — Medir desempenho e disponibilidade aprovados

- **Descrição:** coletar evidências de NFR-03 e NFR-04 depois que stakeholders aprovarem método, ambiente, janela e metas.
- **Tipo:** Infra
- **Requisitos:** NFR-03, NFR-04.
- **Critérios de aceite:**
  - O método e os limites aprovados estão registrados antes da execução.
  - O relatório separa tempo da aplicação da latência Open-Meteo e disponibilidade do app da disponibilidade do provedor.
  - Resultados são comparados aos limites aprovados; desvios geram ação de correção ou revisão formal da meta.
- **Dependências:** T-32 e aprovação das metas NFR-03/NFR-04.
- **Arquivos prováveis:** relatório de validação/monitoramento definido após aprovação do método.

## Rastreabilidade — Requisitos Funcionais

| Requisito da spec | Tarefas correspondentes |
|---|---|
| FR-01 — Buscar cidade | T-05, T-07, T-08, T-09, T-17, T-21, T-22, T-23, T-30, T-31 |
| FR-02 — Exibir clima atual | T-06, T-07, T-10, T-17, T-21, T-22, T-24, T-30 |
| FR-03 — Exibir previsão | T-06, T-07, T-11, T-12, T-17, T-21, T-22, T-25, T-30 |
| FR-04 — Alternar unidade | T-02, T-07, T-16, T-17, T-18, T-22, T-29, T-30 |
| FR-05 — Exibir carregamento | T-07, T-13, T-17, T-22, T-26, T-31 |
| FR-06 — Exibir e recuperar falhas | T-07, T-15, T-17, T-21, T-22, T-28, T-31 |

Todos os requisitos funcionais têm tarefas de implementação e teste associadas. FR-05 tem teste de componente em T-26 e cobertura do estado final após falha em T-31; ainda falta um cenário E2E que mantenha a resposta interceptada pendente e confirme que o loading fica visível antes de liberar a resposta.

## Prioridade e tamanho relativo

**Prioridade:** P0 = núcleo funcional do MVP; P1 = testes e gates necessários antes da entrega; P2 = validação operacional condicional a aprovação de NFRs.

**Tamanho:** P = tarefa isolada e pequena; M = esforço moderado na mesma camada; G = integração ampla, fluxo E2E ou validação de release. São estimativas relativas para planejamento, não horas comprometidas.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | M |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | P |
| T-09 | P0 | P |
| T-10 | P0 | P |
| T-11 | P0 | P |
| T-12 | P0 | P |
| T-13 | P0 | P |
| T-14 | P0 | P |
| T-15 | P0 | P |
| T-16 | P0 | P |
| T-17 | P0 | G |
| T-18 | P1 | P |
| T-19 | P1 | P |
| T-20 | P1 | P |
| T-21 | P1 | M |
| T-22 | P1 | M |
| T-23 | P1 | M |
| T-24 | P1 | P |
| T-25 | P1 | P |
| T-26 | P1 | P |
| T-27 | P1 | P |
| T-28 | P1 | P |
| T-29 | P1 | P |
| T-30 | P1 | G |
| T-31 | P1 | M |
| T-32 | P1 | M |
| T-33 | P2 | G |

## Sequência sugerida em fatias verticais

1. **Fundação:** T-01 a T-04. Prepara contratos e funções puras; ainda não produz uma tela utilizável.
2. **Busca e seleção visíveis:** T-05, parte de busca de T-07, T-08, T-09, T-13 a T-15 e integração parcial de T-17. Entrega busca, resultados, vazio e recuperação de erro.
3. **Clima atual:** T-06 para dados atuais, parte correspondente de T-07, T-10 e integração de T-17. Entrega primeira consulta meteorológica completa após a seleção.
4. **Previsão e unidades:** campos diários de T-06, T-11, T-12, T-16 e integração incremental em T-17. Completa o fluxo principal de cinco dias e Celsius/Fahrenheit.
5. **Validação automatizada:** T-18 a T-31, priorizando testes de serviço e hook junto à primeira fatia, depois componentes e E2E.
6. **Hardening:** T-32 para gates obrigatórios; T-33 somente após aprovação das metas e método de NFR-03/04.

**Ajuste necessário no grafo atual:** T-07 implementa busca e forecast juntos, e T-17 depende de todos os componentes. Para que a fatia 2 produza valor antes da tela completa, dividir T-07 em estado de busca e estado meteorológico e dividir T-17 em bootstrap do app e composições incrementais. Sem essa divisão, a ordem atual ainda produz uma entrega em camadas, não fatias verticais independentes.