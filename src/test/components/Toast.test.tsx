import { act, fireEvent, render, screen } from "@testing-library/react";

import { Toast, type ToastProps } from "@/components/Toast/Toast";
import { ToastViewport } from "@/components/Toast/ToastViewport";
import { toast } from "@/lib/toast";

const TOAST_CONTENT = {
  title: "저장되었습니다.",
  description: "변경 사항이 반영되었습니다.",
};

function renderToast(
  props: Partial<Omit<ToastProps, "id" | "onClose">> & Pick<ToastProps, "type"> = {
    type: "success",
  }
) {
  const onClose = jest.fn();

  render(
    <Toast id="toast-test" duration={60_000} onClose={onClose} {...TOAST_CONTENT} {...props} />
  );

  return onClose;
}

describe("Toast", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("normalizes an object payload before notifying subscribers", () => {
    let receivedToast: unknown;
    const unsubscribe = toast.subscribe((event) => {
      if (event.type === "show") {
        receivedToast = event.toast;
      }
    });

    toast.success({ ...TOAST_CONTENT, showClose: false });
    unsubscribe();

    expect(receivedToast).toMatchObject({
      ...TOAST_CONTENT,
      showClose: false,
      type: "success",
      duration: 3000,
    });
  });

  it("renders title and description while hiding the close button when requested", () => {
    renderToast({ type: "success", showClose: false });

    expect(screen.getByText(TOAST_CONTENT.title)).toBeInTheDocument();
    expect(screen.getByText(TOAST_CONTENT.description)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
  });

  it("renders only the title and shows the close button by default", () => {
    renderToast({ type: "info", title: "제목만 표시합니다.", description: undefined });

    expect(screen.getByText("제목만 표시합니다.")).toBeInTheDocument();
    expect(screen.queryByText(TOAST_CONTENT.description)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  it.each([
    [
      "info",
      "bg-[#1a2332]",
      "border-[#2a4a6b]",
      "text-[#6699ff]",
      "M10 10L10 14.5M10 6.66455V6.625",
    ],
    [
      "success",
      "bg-[#1a2e1a]",
      "border-[#2b5a2b]",
      "text-[#4dcc66]",
      "M13.142 7.98299L8.875 12.25L7.42049 10.7955",
    ],
    [
      "warning",
      "bg-[#2e2a1a]",
      "border-[#5a4a2b]",
      "text-[#ffcc4d]",
      "M10.0006 9.90003V5.41447M10.0006 13.2248V13.2642",
    ],
    ["error", "bg-[#2e1a1a]", "border-[#5a2b2b]", "text-[#ff5959]", "M10 10V5.5M10 13.3354V13.375"],
  ] as const)(
    "applies the Figma %s visual state",
    (type, backgroundClass, borderClass, iconColorClass, iconPath) => {
      renderToast({ type });

      const alert = screen.getByRole("alert");
      const icon = alert.querySelector('[aria-hidden="true"]');

      expect(alert).toHaveClass(backgroundClass, borderClass);
      expect(icon).toHaveClass(iconColorClass);
      expect(icon?.querySelector("path")).toHaveAttribute("d", expect.stringContaining(iconPath));
    }
  );

  it("keeps a legacy string call visible as a title through the viewport", () => {
    render(<ToastViewport />);

    act(() => {
      toast.info("기존 호출도 유지됩니다.");
    });

    expect(screen.getByText("기존 호출도 유지됩니다.")).toBeInTheDocument();
  });

  it("closes after the existing exit-animation delay", () => {
    jest.useFakeTimers();
    const onClose = renderToast({ type: "error" });

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledWith("toast-test");
  });

  it("automatically closes after the existing duration and exit-animation delay", () => {
    jest.useFakeTimers();
    const onClose = renderToast({ type: "error", duration: 3000 });

    act(() => {
      jest.advanceTimersByTime(3199);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledWith("toast-test");
  });
});
