import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SubscriptionPlans from '../components/SubscriptionPlans';

describe('SubscriptionPlans Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders correctly for logged-in users with default state', () => {
    // Simulate logged-in user
    localStorage.setItem("accessToken", "fake-token");
    render(
      <MemoryRouter>
        <SubscriptionPlans />
      </MemoryRouter>
    );

    // Check pricing header shows "Tier 2 Pricing"
    expect(screen.getByText(/Tier 2 Pricing/i)).toBeInTheDocument();

    // Check price is "$3995" (from "$3995 Per Annum")
    expect(screen.getByText("$3995")).toBeInTheDocument();

    // Verify pricing header background color is "#ffd700" for the default payment option
    const pricingHeader = screen.getByText(/Tier 2 Pricing/i).parentElement;
    expect(pricingHeader).toHaveStyle({ backgroundColor: "#ffd700" });

    // Payment options should be visible
    expect(screen.getByLabelText(/Monthly/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quarterly/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annually/i)).toBeInTheDocument();

    // "Join now" button (from LoginHandler) should not be rendered for logged-in users
    expect(screen.queryByText(/Join now/i)).not.toBeInTheDocument();
  });

  test('renders correctly for non-logged in users', () => {
    // Ensure no access token exists
    localStorage.removeItem("accessToken");

    render(
      <MemoryRouter>
        <SubscriptionPlans />
      </MemoryRouter>
    );

    // Should render the "Join now" button provided by LoginHandler
    expect(screen.getByText(/Join now/i)).toBeInTheDocument();

    // Pricing card should still be visible with default Tier 2 settings
    expect(screen.getByText(/Tier 2 Pricing/i)).toBeInTheDocument();
  });

  test('updates to tier 1 and reflects changes in UI', () => {
    localStorage.setItem("accessToken", "fake-token");
    const { container } = render(
      <MemoryRouter>
        <SubscriptionPlans />
      </MemoryRouter>
    );

    // Initially, tier level is "2" so payment options are present
    expect(screen.getByLabelText(/Monthly/i)).toBeInTheDocument();

    // Change tier level by clicking the "One" radio button
    const tierOneRadio = screen.getByLabelText("One");
    fireEvent.click(tierOneRadio);

    // Header should update to "Tier 1 Pricing"
    expect(screen.getByText(/Tier 1 Pricing/i)).toBeInTheDocument();

    // Pricing header background should update to "#000000" for tier 1
    const pricingHeader = screen.getByText(/Tier 1 Pricing/i).parentElement;
    expect(pricingHeader).toHaveStyle({ backgroundColor: "#000000" });

    // Price should update to "Free" – select the element with class "price" to avoid ambiguity
    const priceDiv = container.querySelector('.price');
    expect(priceDiv).toHaveTextContent("Free");

    // Payment period radio options should not be rendered when tier level is "1"
    expect(screen.queryByLabelText(/Monthly/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Quarterly/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Annually/i)).not.toBeInTheDocument();

    // Verify that the "Company: All data" feature now displays a cross (✗)
    const companyFeatureItem = screen.getByText("Company: All data").closest("li");
    const checkmark = companyFeatureItem.querySelector(".checkmark");
    expect(checkmark).toHaveTextContent("✗");
  });

  test('updates payment option and reflects updated price and background colour', () => {
    localStorage.setItem("accessToken", "fake-token");
    const { container } = render(
      <MemoryRouter>
        <SubscriptionPlans />
      </MemoryRouter>
    );

    // Default is "$3995 Per Annum" with background "#ffd700"
    // Change payment option to "$895 Per Month"
    const monthlyRadio = screen.getByLabelText("Monthly");
    fireEvent.click(monthlyRadio);

    // Pricing header background should update to "#cd7f32" for "$895 Per Month"
    const pricingHeader = screen.getByText(/Tier 2 Pricing/i).parentElement;
    expect(pricingHeader).toHaveStyle({ backgroundColor: "#cd7f32" });

    // Check that the price now displays "$895"
    expect(screen.getByText("$895")).toBeInTheDocument();
  });
});
