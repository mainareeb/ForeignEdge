/**
 * App.test.js — ForeignEdge Frontend Tests
 * Run with: npm test
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Mock API
jest.mock("./services/api", () => ({
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
  getUniversities: jest.fn(() =>
    Promise.resolve({ data: { results: [], total: 0 } }),
  ),
  getScholarships: jest.fn(() =>
    Promise.resolve({ data: { results: [], total: 0 } }),
  ),
  getPlatformStats: jest.fn(() =>
    Promise.resolve({
      data: { universities: 201, scholarships: 71, countries: 41 },
    }),
  ),
  getCountryInfo: jest.fn(() => Promise.resolve({ data: {} })),
  chatQuery: jest.fn(() => Promise.resolve({ data: { reply: "Hello!" } })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

function renderWithRouter(ui, { route = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

// ── 1. App Renders ────────────────────────────────────────────────────────────
describe("App", () => {
  test("renders without crashing", () => {
    render(<App />);
  });

  test("shows ForeignEdge branding", () => {
    render(<App />);
    expect(screen.getAllByText(/ForeignEdge/i).length).toBeGreaterThan(0);
  });
});

// ── 2. Navbar ─────────────────────────────────────────────────────────────────
describe("Navbar", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  test("shows main navigation links", () => {
    render(<App />);
    expect(screen.getByText(/Universities/i)).toBeInTheDocument();
    expect(screen.getByText(/Scholarships/i)).toBeInTheDocument();
    expect(screen.getByText(/Visa/i)).toBeInTheDocument();
  });

  test("shows Login and Register when not logged in", () => {
    render(<App />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  test("shows Dashboard and Logout when logged in", () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "token") return "fake-token";
      if (key === "user")
        return JSON.stringify({ name: "Test User", email: "test@test.com" });
      return null;
    });
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});

// ── 3. Login Page ─────────────────────────────────────────────────────────────
describe("Login Page", () => {
  test("login page renders", () => {
    renderWithRouter(<App />, { route: "/login" });
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test("login button is clickable", () => {
    render(<App />);
    const loginBtn = screen.getByText(/Login/i);
    fireEvent.click(loginBtn);
  });
});

// ── 4. 404 Page ───────────────────────────────────────────────────────────────
describe("404 Page", () => {
  test("shows 404 for unknown routes", () => {
    renderWithRouter(<App />, { route: "/this-does-not-exist" });
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });

  test("404 page has home link", () => {
    renderWithRouter(<App />, { route: "/nonexistent" });
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });
});

// ── 5. Error Boundary ─────────────────────────────────────────────────────────
describe("Error Boundary", () => {
  test("app does not crash on load", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    spy.mockRestore();
  });
});
