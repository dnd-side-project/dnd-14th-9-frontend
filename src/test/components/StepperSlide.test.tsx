import { render, screen, fireEvent } from "@testing-library/react";

import { StepperSlide } from "../../components/StepperSlide/StepperSlide";

describe("StepperSlide", () => {
  describe("렌더링", () => {
    it("기본 렌더링이 되어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("현재 값이 말풍선에 표시되어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={75} onChange={onChange} />);

      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("내 집중도 마커가 표시되어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} myFocusValue={30} />);

      expect(screen.getByText("내 집중도")).toBeInTheDocument();
    });

    it("내 집중도 값이 없으면 마커가 표시되지 않아야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      expect(screen.queryByText("내 집중도")).not.toBeInTheDocument();
    });

    it("격자 숫자(0, 20, 40, 60, 80, 100)가 표시되어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("40")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument();
      expect(screen.getByText("80")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("slider role이 있어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();
    });

    it("aria-valuenow가 현재 값을 반영해야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={65} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "65");
    });

    it("aria-valuemin과 aria-valuemax가 설정되어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} min={10} max={90} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "10");
      expect(slider).toHaveAttribute("aria-valuemax", "90");
    });

    it("비활성화 시 aria-disabled가 true여야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} disabled />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("키보드 조작", () => {
    it("ArrowRight 키로 값이 1 증가해야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowRight" });

      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("ArrowUp 키로 값이 1 증가해야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowUp" });

      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("ArrowLeft 키로 값이 1 감소해야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowLeft" });

      expect(onChange).toHaveBeenCalledWith(49);
    });

    it("ArrowDown 키로 값이 1 감소해야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowDown" });

      expect(onChange).toHaveBeenCalledWith(49);
    });

    it("Home 키로 최소값으로 이동해야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} min={10} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "Home" });

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it("End 키로 최대값으로 이동해야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} max={90} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "End" });

      expect(onChange).toHaveBeenCalledWith(90);
    });

    it("최대값에서 ArrowRight 키를 눌러도 최대값을 초과하지 않아야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={100} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowRight" });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("최소값에서 ArrowLeft 키를 눌러도 최소값 미만이 되지 않아야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={0} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowLeft" });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("비활성화 상태", () => {
    it("비활성화 시 키보드 조작이 동작하지 않아야 합니다", async () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} disabled />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowRight" });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("비활성화 시 tabIndex가 -1이어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} disabled />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("tabIndex", "-1");
    });

    it("활성화 시 tabIndex가 0이어야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={50} onChange={onChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("커스텀 min/max", () => {
    it("커스텀 min/max 범위에서 올바르게 동작해야 합니다", () => {
      const onChange = jest.fn();
      render(<StepperSlide value={25} onChange={onChange} min={20} max={30} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "25");
      expect(slider).toHaveAttribute("aria-valuemin", "20");
      expect(slider).toHaveAttribute("aria-valuemax", "30");
    });
  });

  describe("className", () => {
    it("커스텀 className이 적용되어야 합니다", () => {
      const onChange = jest.fn();
      const { container } = render(
        <StepperSlide value={50} onChange={onChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
