import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders ForeignEdge title", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const titleElement = screen.getByText(/ForeignEdge/i);
  expect(titleElement).toBeInTheDocument();
});

test("shows login form", async () => {
  render(
    <MemoryRouter initialEntries={["/auth/login"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
});

test("shows register form", async () => {
  render(
    <MemoryRouter initialEntries={["/auth/register"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
});

test("navigation works", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );

  const navItems = [
    "Home",
    "Universities",
    "Scholarships",
    "Visa",
    "Dashboard",
  ];

  navItems.forEach((item) => {
    const navLink = screen.getByText(item);
    expect(navLink).toBeInTheDocument();
  });
});

test("private route redirects to login", () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});

test("private route shows dashboard when logged in", async () => {
  // Mock localStorage token
  localStorage.setItem("token", "mock-jwt-token");

  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
