import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, beforeEach, describe, test, expect } from "vitest";
import Categories from "../pages/admin/Categories";

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
          items: [
            {
              categoryId: 1,
              categoryName: "Hair",
              serviceCount: 2,
              isActive: true,
            },
          ],
          totalPages: 1,
          totalRecords: 1,
        }),
    })
  );
});

describe("Categories", () => {
  test("renders category list", async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(await screen.findByText("Hair")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});