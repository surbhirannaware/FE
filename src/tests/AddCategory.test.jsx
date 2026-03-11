 import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AddCategory from "../pages/admin/AddCategory";
import toast from "react-hot-toast";

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("AddCategory", () => {
  test("shows toast error when category name is empty", () => {
    render(
      <MemoryRouter>
        <AddCategory />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(toast.error).toHaveBeenCalledWith("Category name is required");
  });
});