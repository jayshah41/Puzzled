import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/Home';

jest.mock('../components/Hero', () => () => <div>Mocked Hero Component</div>);
jest.mock('../components/Services', () => () => <div>Mocked Services Component</div>);
jest.mock('../components/Values', () => () => <div>Mocked Values Component</div>);
jest.mock('../components/Contact', () => () => <div>Mocked Contact Component</div>);

describe('Home Page', () => {
  test('renders all child components', () => {
    render(<Home />);

    expect(screen.getByText('Mocked Hero Component')).toBeInTheDocument();
    expect(screen.getByText('Mocked Services Component')).toBeInTheDocument();
    expect(screen.getByText('Mocked Values Component')).toBeInTheDocument();
    expect(screen.getByText('Mocked Contact Component')).toBeInTheDocument();
  });
});