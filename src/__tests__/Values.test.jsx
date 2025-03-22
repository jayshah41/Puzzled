import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Values from '../components/Values';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { section: 'heading', text_value: "MakCorp's Value to Clients" },
          { section: 'title1', text_value: 'We save you time' },
          { section: 'content1', text_value: 'We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them.' },
          { section: 'title2', text_value: 'Visualization of Key Data' },
          { section: 'content2', text_value: 'MakCorp provides in depth data in a visual interface.' },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Values Component', () => {
  test('renders the heading', async () => {
    render(<Values />);

    expect(await screen.findByText("MakCorp's Value to Clients")).toBeInTheDocument();
  });

  test('renders all value components', async () => {
    render(<Values />);

    expect(await screen.findByText('We save you time')).toBeInTheDocument();
    expect(await screen.findByText('We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them.')).toBeInTheDocument();
    expect(await screen.findByText('Visualization of Key Data')).toBeInTheDocument();
    expect(await screen.findByText('MakCorp provides in depth data in a visual interface.')).toBeInTheDocument();
  });
});