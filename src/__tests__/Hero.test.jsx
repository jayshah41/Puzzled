import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Hero from '../components/Hero';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { section: 'title', text_value: 'MakCorp has modernised how our clients invest in Mining, Oil & Gas.' },
          { section: 'intro', text_value: 'Compare & analyse ASX resource companies, including' },
          { section: 'bulletPoints', text_value: 'Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more#Over 8,500 directors including remuneration and shareholdings#Over 2,700 capital raises and their information' },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Hero Component', () => {
  test('renders the title, intro, and bullet points', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Hero />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('MakCorp has modernised how our clients invest in Mining, Oil & Gas.')).toBeInTheDocument();
    expect(await screen.findByText('Compare & analyse ASX resource companies, including')).toBeInTheDocument();
    expect(await screen.findByText('Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more')).toBeInTheDocument();
    expect(await screen.findByText('Over 8,500 directors including remuneration and shareholdings')).toBeInTheDocument();
    expect(await screen.findByText('Over 2,700 capital raises and their information')).toBeInTheDocument();
  });

  test('renders the login button when the user is not logged in', async () => {
    localStorage.removeItem('accessToken');
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(await screen.findByText('Start now')).toBeInTheDocument();
  });

  test('does not render the login button when the user is logged in', async () => {
    localStorage.setItem('accessToken', 'mockToken');
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(screen.queryByText('Start now')).not.toBeInTheDocument();
  });
});