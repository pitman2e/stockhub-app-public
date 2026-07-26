import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import ConfirmationDialogWrapper from "../components/ConfirmationDialogWrapper";

describe("ConfirmationDialogWrapper", () => {
  it("forwards the disabled state to the wrapped action button", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ConfirmationDialogWrapper
          WrappingComponent={({ onClick, disabled }) => (
            <button type="button" onClick={onClick} disabled={disabled}>
              Delete
            </button>
          )}
          title="Confirmation"
          description="Are you sure to delete this record ?"
          onDialogConfirm={async () => {}}
          disabled={true}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect((button as HTMLButtonElement).disabled).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
