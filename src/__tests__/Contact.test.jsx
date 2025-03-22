import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Contact from '../components/Contact';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          { section: 'title', text_value: 'Meet Our Team' },
          { section: 'introText', text_value: 'Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.' },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('../components/ContactCard', () => ({ contact }) => (
  <div>
    <h3>{contact.name}</h3>
    <p>{contact.role}</p>
  </div>
));

describe('Contact Component', () => {
  test('renders the title and intro text', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText('Meet Our Team')).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews.'
      )
    ).toBeInTheDocument();
  });

  test('renders all contact cards', async () => {
    const contacts = [
      { name: 'Steve Rosewell', role: 'Executive Chairman' },
      { name: 'Robert Williamson', role: 'Director' },
      { name: 'Scott Yull', role: 'Director' },
      { name: 'Emmanuel Heyndrickx', role: 'Executive Director' },
    ];

    await act(async () => {
      render(
        <MemoryRouter>
          <Contact />
        </MemoryRouter>
      );
    });

    contacts.forEach(contact => {
      expect(screen.getByText(contact.name)).toBeInTheDocument();
      expect(screen.getAllByText(contact.role).length).toBeGreaterThanOrEqual(1);
    });
  });
});