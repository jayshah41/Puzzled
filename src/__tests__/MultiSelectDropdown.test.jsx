import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

describe('MultiSelectDropdown', () => {
  const mockOptions = [
    { value: 'Any', label: 'Any' },
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];
  
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders with the correct label', () => {
    render(<MultiSelectDropdown label="Test Label" options={mockOptions} onChange={mockOnChange} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('renders with default "Select options" text when no selectedValues provided', () => {
    const { container } = render(<MultiSelectDropdown label="Test Label" options={mockOptions} onChange={mockOnChange} />);
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Select options');
  });

  test('displays "Select options" text with empty array selectedValues', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={[]} 
        onChange={mockOnChange} 
      />
    );

    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Select options');

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const anyCheckbox = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.parentElement.textContent.includes('Any'));

    expect(anyCheckbox).toBeDefined();
  });

  test('handles non-array selectedValues by converting to array', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues="option1" 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(["Any"]);
  });

  test('handles null selectedValues by defaulting to ["Any"]', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={null} 
        onChange={mockOnChange} 
      />
    );
    
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Any');
  });

  test('opens dropdown when header is clicked', () => {
    const { container } = render(<MultiSelectDropdown label="Test Label" options={mockOptions} onChange={mockOnChange} />);

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('closes dropdown when clicking outside', async () => {
    const { container } = render(<MultiSelectDropdown label="Test Label" options={mockOptions} onChange={mockOnChange} />);

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    expect(screen.getByText('Option 1')).toBeInTheDocument();

    fireEvent.mouseDown(document);

    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  test('selects an option when clicked', () => {
    const { container } = render(<MultiSelectDropdown label="Test Label" options={mockOptions} onChange={mockOnChange} />);

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['option1']);
  });

  test('deselects "Any" when another option is selected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['Any']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['option1']);
  });

  test('selects "Any" when all other options are deselected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Any']);
  });

  test('selects multiple options', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const option2Checkbox = screen.getByLabelText('Option 2');
    fireEvent.click(option2Checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  test('deselects an option when it is already selected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1', 'option2']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['option2']);
  });

  test('displays "Any" when "Any" is selected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['Any']} 
        onChange={mockOnChange} 
      />
    );
    
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Any');
  });

  test('displays selected option label when one option is selected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1']} 
        onChange={mockOnChange} 
      />
    );
    
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Option 1');
  });

  test('displays selected options labels when two options are selected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1', 'option2']} 
        onChange={mockOnChange} 
      />
    );
    
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Option 1, Option 2');
  });

  test('displays count when more than two options are selected', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1', 'option2', 'option3']} 
        onChange={mockOnChange} 
      />
    );
    
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('3 selected');
  });

  test('ensures selected values are maintained during re-renders', () => {

    const { container, rerender } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={[]} 
        onChange={mockOnChange} 
      />
    );

    rerender(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={[]} 
        onChange={mockOnChange} 
      />
    );

    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('Select options');
    
    rerender(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues="option1" 
        onChange={mockOnChange} 
      />
    );
 
    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);
    
    const option1Checkbox = screen.getByLabelText('Option 1');
    expect(option1Checkbox).toBeChecked();
  });

  test('displays raw value when option with selected value does not exist', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['nonExistentOption']} 
        onChange={mockOnChange} 
      />
    );
    
    const dropdownText = container.querySelector('.dropdown-text');
    expect(dropdownText.textContent).toBe('nonExistentOption');
  });

  test('does not call onChange when new selection is identical to current', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);
    
    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox); // Deselect
    mockOnChange.mockClear(); 
    fireEvent.click(option1Checkbox); 
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('sorts options with selected options at the top', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option2']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const optionLabels = screen.getAllByRole('checkbox').map(checkbox => 
      checkbox.parentElement.textContent.trim());

    const option2Index = optionLabels.indexOf('Option 2');
    const option1Index = optionLabels.indexOf('Option 1');
    const option3Index = optionLabels.indexOf('Option 3');
    
    expect(option2Index).toBeLessThan(option1Index);
    expect(option2Index).toBeLessThan(option3Index);
  });

  test('selects "Any" when clicking on "Any" option', () => {
    const { container } = render(
      <MultiSelectDropdown 
        label="Test Label" 
        options={mockOptions} 
        selectedValues={['option1', 'option2']} 
        onChange={mockOnChange} 
      />
    );

    const header = container.querySelector('.dropdown-header');
    fireEvent.click(header);

    const anyCheckbox = screen.getByLabelText('Any');
    fireEvent.click(anyCheckbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Any']);
  });
});