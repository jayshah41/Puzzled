import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import ValueComponent from "../components/ValueComponent";

jest.mock('../assets/Values/critical-info.png', () => 'critical-info.png');
jest.mock('../assets/Values/key-data.png', () => 'key-data.png');
jest.mock('../assets/Values/save-time.png', () => 'save-time.png');
jest.mock('../assets/Values/time-saving-analytics.png', () => 'time-saving-analytics.png');

jest.mock('../styles/GeneralStyles.css', () => ({}));
jest.mock('../styles/ValueComponent.css', () => ({}));

describe('ValueComponent', () => {
  const defaultProps = {
    index: 1,
    title: "Test Title",
    content: "Test Content",
    isEditing: false,
    setContentMap: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly in view mode with odd index', () => {
    render(<ValueComponent {...defaultProps} />);
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    
    expect(screen.getByText("1")).toBeInTheDocument();
    
    const image = screen.getByAltText("Test Title");
    expect(image).toBeInTheDocument();
  });

  test('renders correctly in view mode with even index', () => {
    render(<ValueComponent {...defaultProps} index={2} />);
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    
    expect(screen.getByText("2")).toBeInTheDocument();
    
    const image = screen.getByAltText("Test Title");
    expect(image).toBeInTheDocument();
  });

  test('renders correctly in edit mode', () => {
    render(<ValueComponent {...defaultProps} isEditing={true} />);
    
    const titleInput = screen.getByDisplayValue("Test Title");
    const contentTextarea = screen.getByDisplayValue("Test Content");
    
    expect(titleInput).toBeInTheDocument();
    expect(contentTextarea).toBeInTheDocument();
    expect(titleInput.tagName.toLowerCase()).toBe("input");
    expect(contentTextarea.tagName.toLowerCase()).toBe("textarea");
  });

  test('handles title changes correctly', () => {
    render(<ValueComponent {...defaultProps} isEditing={true} />);
    
    const titleInput = screen.getByDisplayValue("Test Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    
    expect(defaultProps.setContentMap).toHaveBeenCalled();
    const setContentMapCallback = defaultProps.setContentMap.mock.calls[0][0];
    const prevContentMap = [{ title: "Test Title", content: "Test Content" }];
    const result = setContentMapCallback(prevContentMap);
    
    expect(result).toEqual([{ title: "New Title", content: "Test Content" }]);
  });

  test('handles content changes correctly', () => {
    render(<ValueComponent {...defaultProps} isEditing={true} />);
    
    const contentTextarea = screen.getByDisplayValue("Test Content");
    fireEvent.change(contentTextarea, { target: { value: "New Content" } });
    
    expect(defaultProps.setContentMap).toHaveBeenCalled();
    const setContentMapCallback = defaultProps.setContentMap.mock.calls[0][0];
    const prevContentMap = [{ title: "Test Title", content: "Test Content" }];
    const result = setContentMapCallback(prevContentMap);
    
    expect(result).toEqual([{ title: "Test Title", content: "New Content" }]);
  });

  test('renders an image for index 3', () => {
    render(<ValueComponent {...defaultProps} index={3} />);
    
    const image = screen.getByAltText("Test Title");
    expect(image).toBeInTheDocument();
  });

  test('renders an image for index 4', () => {
    render(<ValueComponent {...defaultProps} index={4} />);
    
    const image = screen.getByAltText("Test Title");
    expect(image).toBeInTheDocument();
    
    expect(image.src).toContain("time-saving-analytics.png");
  });

  test('input and textarea have the correct className', () => {
    render(<ValueComponent {...defaultProps} isEditing={true} />);
    
    const titleInput = screen.getByDisplayValue("Test Title");
    const contentTextarea = screen.getByDisplayValue("Test Content");
    
    expect(titleInput).toHaveClass("auth-input");
    expect(contentTextarea).toHaveClass("auth-input");
  });

  test('value-section and content-container have the correct className', () => {
    const { container } = render(<ValueComponent {...defaultProps} />);
    
    expect(container.querySelector(".value-section")).toBeInTheDocument();
    expect(container.querySelector(".content-container")).toBeInTheDocument();
  });

  test('handles null or undefined props gracefully', () => {
    const minimalProps = {
      index: 1,
      setContentMap: jest.fn(),
    };
    
    expect(() => render(<ValueComponent {...minimalProps} />)).not.toThrow();
  });

  test('verifies image placement based on index parity', () => {
    const { container } = render(<ValueComponent {...defaultProps} index={1} />);
    
    let firstChild = container.querySelector('.value-section').firstChild;
    expect(firstChild.classList.contains('illustration-container')).toBe(true);
    
    const { container: container2 } = render(<ValueComponent {...defaultProps} index={2} />);
    let lastChild = container2.querySelector('.value-section').lastChild;
    expect(lastChild.classList.contains('illustration-container')).toBe(true);
  });
});