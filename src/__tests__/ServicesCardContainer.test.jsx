import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServicesCardContainer from '../components/ServicesCardContainer';

describe('ServicesCardContainer', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with initial data', async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'title1', text_value: 'Commodity Pricing' },
        { section: 'content1', text_value: 'See the prices for each commodity on a daily basis including potential value of JORCS.' },
        { section: 'title2', text_value: 'Stock Performance' },
        { section: 'content2', text_value: 'See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly.' },
        { section: 'title3', text_value: 'Data Services' },
        { section: 'content3', text_value: 'Contact us for other data services including project research and director research.' },
      ]),
    });

    const { findByText } = render(<ServicesCardContainer isEditing={false} />);

    expect(await findByText('Commodity Pricing')).toBeInTheDocument();
    expect(await findByText('See the prices for each commodity on a daily basis including potential value of JORCS.')).toBeInTheDocument();
    expect(await findByText('Stock Performance')).toBeInTheDocument();
    expect(await findByText('See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly.')).toBeInTheDocument();
    expect(await findByText('Data Services')).toBeInTheDocument();
    expect(await findByText('Contact us for other data services including project research and director research.')).toBeInTheDocument();
  });

  it('fetches data on mount', async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'title1', text_value: 'Commodity Pricing' },
        { section: 'content1', text_value: 'See the prices for each commodity on a daily basis including potential value of JORCS.' },
      ]),
    });

    render(<ServicesCardContainer isEditing={false} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/editable-content/?component=Services');
    });
  });

  it('does not save content when not in editing mode', async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'title1', text_value: 'Commodity Pricing' },
        { section: 'content1', text_value: 'See the prices for each commodity on a daily basis including potential value of JORCS.' },
      ]),
    });

    render(<ServicesCardContainer isEditing={false} />);

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalledWith('/api/editable-content/update/', expect.any(Object));
    });
  });

  it('clears error message when switching to editing mode', async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        { section: 'title1', text_value: 'Commodity Pricing' },
        { section: 'content1', text_value: 'See the prices for each commodity on a daily basis including potential value of JORCS.' },
      ]),
    });

    const { rerender, queryByText } = render(<ServicesCardContainer isEditing={false} />);

    rerender(<ServicesCardContainer isEditing={true} />);

    expect(queryByText('There was an error fetching the editable content')).not.toBeInTheDocument();
  });
});