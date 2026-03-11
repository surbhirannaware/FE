import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}