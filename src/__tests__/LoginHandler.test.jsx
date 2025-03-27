import React from "react";
import { render, act } from "@testing-library/react";
import LoginHandler from "../components/LoginHandler";

const mockNavigate = jest.fn();
const mockChildren = jest.fn();
const mockReload = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../components/Login", () => {
  return jest.fn(({ onClose, loginButton, onLoginSuccess }) => (
    <div data-testid="login-modal">
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
      <button data-testid="login-button" onClick={onLoginSuccess}>
        {loginButton ? "Login" : "Signup"}
      </button>
    </div>
  ));
});

Object.defineProperty(window, 'location', {
  writable: true,
  value: { reload: mockReload }
});

describe("LoginHandler Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockChildren.mockClear();
    mockReload.mockClear();
    const LoginMock = require("../components/Login");
    LoginMock.mockClear();
  });

  test("renders children with correct props", () => {
    render(<LoginHandler>{mockChildren}</LoginHandler>);
    expect(mockChildren).toHaveBeenCalledWith(
      expect.objectContaining({
        handleOpenLogin: expect.any(Function),
        handleOpenSignup: expect.any(Function),
      })
    );
  });

  test("handleClose hides the login modal", () => {
    const LoginMock = require("../components/Login");
    LoginMock.mockClear();
    let handleOpenLogin;
    let onClose;
    LoginMock.mockImplementation(props => {
      onClose = props.onClose;
      return null;
    });
    render(
      <LoginHandler>
        {(props) => {
          handleOpenLogin = props.handleOpenLogin;
          mockChildren(props);
          return null;
        }}
      </LoginHandler>
    );
    act(() => {
      handleOpenLogin();
    });
    expect(LoginMock).toHaveBeenCalled();
    LoginMock.mockClear();
    act(() => {
      onClose();
    });
    expect(LoginMock).not.toHaveBeenCalled();
  });

  test("handleLoginSuccess navigates and reloads the page", () => {
    const LoginMock = require("../components/Login");
    LoginMock.mockClear();
    let handleOpenLogin;
    let onLoginSuccess;
    LoginMock.mockImplementation(props => {
      onLoginSuccess = props.onLoginSuccess;
      return null;
    });
    render(
      <LoginHandler>
        {(props) => {
          handleOpenLogin = props.handleOpenLogin;
          mockChildren(props);
          return null;
        }}
      </LoginHandler>
    );
    act(() => {
      handleOpenLogin();
    });
    mockNavigate.mockClear();
    act(() => {
      onLoginSuccess();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(mockReload).toHaveBeenCalled();
  });
});