import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, beforeEach, describe, test, expect } from "vitest";
import EditCategory from "../pages/admin/EditCategory";

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          categoryName: "Hair",
          isActive: true,
        }),
    })
  );
});

describe("EditCategory", () => {
  test("loads category data", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/categories/edit/1"]}>
        <Routes>
          <Route path="/admin/categories/edit/:id" element={<EditCategory />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("Hair")).toBeInTheDocument();
  });
});