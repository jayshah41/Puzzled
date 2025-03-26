import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../components/InputField';

describe('InputField Component', () => {
    it('renders the input field with the correct props', () => {
        render(
            <InputField
                type="text"
                value="test value"
                onChange={() => {}}
                placeholder="Enter text"
            />
        );

        const inputElement = screen.getByPlaceholderText('Enter text');
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute('type', 'text');
        expect(inputElement).toHaveValue('test value');
    });

    it('calls onChange when the input value changes', () => {
        const handleChange = jest.fn();
        render(
            <InputField
                type="text"
                value=""
                onChange={handleChange}
                placeholder="Enter text"
            />
        );

        const inputElement = screen.getByPlaceholderText('Enter text');
        fireEvent.change(inputElement, { target: { value: 'new value' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('renders with required attribute by default', () => {
        render(
            <InputField
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Enter text"
            />
        );

        const inputElement = screen.getByPlaceholderText('Enter text');
        expect(inputElement).toBeRequired();
    });

    it('does not render with required attribute when required is false', () => {
        render(
            <InputField
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Enter text"
                required={false}
            />
        );

        const inputElement = screen.getByPlaceholderText('Enter text');
        expect(inputElement).not.toBeRequired();
    });
});