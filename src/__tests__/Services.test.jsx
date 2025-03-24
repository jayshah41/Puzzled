import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Services from '../components/Services';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { section: 'heading', text_value: 'Our Services' },
          { section: 'description', text_value: 'See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly.' },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Services Component', () => {
  test('renders the heading and description', async () => {
    render(<Services />);

    expect(await screen.findByText('Our Services')).toBeInTheDocument();
    expect(await screen.findByText('See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly.')).toBeInTheDocument();
  });
});