// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { PasswordInput, SearchInput, Tabs } from "./index";
afterEach(cleanup);
describe("shared controls", () => {
  it("reveals and conceals a password without changing its value", () => {
    render(
      <PasswordInput
        label="Password"
        showLabel="Show"
        hideLabel="Hide"
        defaultValue="secret"
      />,
    );
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(input.type).toBe("text");
    expect(input.value).toBe("secret");
    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(input.type).toBe("password");
  });
  it("supports keyboard selection and roving focus in tabs", () => {
    function Harness() {
      const [value, set] = useState("graph");
      return (
        <Tabs
          label="Tools"
          value={value}
          onChange={set}
          items={[
            { value: "graph", label: "Graph" },
            { value: "state", label: "State" },
          ]}
        />
      );
    }
    render(<Harness />);
    const graph = screen.getByRole("tab", { name: "Graph" });
    graph.focus();
    fireEvent.keyDown(graph, { key: "ArrowRight" });
    const state = screen.getByRole("tab", { name: "State" });
    expect(state.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(state);
  });
  it("clears search through the controlled callback", () => {
    function Harness() {
      const [value, set] = useState("merge");
      return (
        <SearchInput
          value={value}
          onChange={set}
          label="Search"
          clearLabel="Clear"
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  });
});
