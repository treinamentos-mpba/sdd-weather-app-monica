import { expect, type Page, test } from '@playwright/test';

const geocodingResponse = {
  results: [
    {
      id: 2267057,
      name: 'Lisboa',
      admin1: 'Lisboa',
      country: 'Portugal',
      latitude: 38.7167,
      longitude: -9.1333,
      timezone: 'Europe/Lisbon',
    },
  ],
};

const forecastResponse = {
  timezone: 'Europe/Lisbon',
  current: {
    temperature_2m: 0,
    apparent_temperature: 0,
    relative_humidity_2m: 60,
    precipitation: 0,
    weather_code: 0,
    wind_speed_10m: 4,
    surface_pressure: 1013,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [0, 1, 2, 3, 4],
    temperature_2m_max: [0, 5, 6, 7, 8],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

async function mockSuccessfulWeather(page: Page) {
  const calls = { geocoding: 0, forecast: 0 };

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    calls.geocoding += 1;
    await route.fulfill({ json: geocodingResponse });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    calls.forecast += 1;
    await route.fulfill({ json: forecastResponse });
  });

  return calls;
}

async function searchForLisbon(page: Page) {
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
}

test('busca uma cidade, exibe previsão de cinco dias e converte temperatura para Fahrenheit', async ({
  page,
}) => {
  const calls = await mockSuccessfulWeather(page);

  await page.goto('/');
  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Previsão dos próximos cinco dias' }).getByRole('article'),
  ).toHaveCount(5);
  const currentWeather = page.getByRole('region', { name: 'Lisboa' });
  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();
  expect(calls.geocoding).toBe(1);
  expect(calls.forecast).toBe(1);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(currentWeather.getByText('32 °F', { exact: true })).toBeVisible();
  expect(calls.forecast).toBe(1);
});

test('mostra estado vazio quando o geocoding retorna um objeto sem results', async ({ page }) => {
  let forecastCalls = 0;

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastCalls += 1;
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Cidade não encontrada' })).toBeVisible();
  expect(forecastCalls).toBe(0);
});

test('renderiza clima e previsão no viewport mobile de 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const calls = await mockSuccessfulWeather(page);

  await page.goto('/');
  await searchForLisbon(page);

  await expect(
    page.getByRole('region', { name: 'Lisboa' }).getByText('0 °C', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Previsão dos próximos cinco dias' }).getByRole('article'),
  ).toHaveCount(5);
  expect(calls.geocoding).toBe(1);
  expect(calls.forecast).toBe(1);

  const viewportHasNoHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(viewportHasNoHorizontalOverflow).toBe(true);
});
