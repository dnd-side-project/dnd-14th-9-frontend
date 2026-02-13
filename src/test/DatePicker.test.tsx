import { render, screen, fireEvent } from "@testing-library/react";

import { DatePicker } from "@/components/DatePicker/DatePicker";
import type { DateRange } from "@/components/DatePicker/DatePicker.types";

describe("DatePicker", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-13T12:00:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("렌더링", () => {
    it("기본 DatePicker가 렌더링되어야 합니다", () => {
      render(<DatePicker />);

      expect(screen.getByText("2026.02")).toBeInTheDocument();
      expect(screen.getByLabelText("이전 달")).toBeInTheDocument();
      expect(screen.getByLabelText("다음 달")).toBeInTheDocument();
    });

    it("요일 헤더가 표시되어야 합니다", () => {
      render(<DatePicker />);

      const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
      weekdays.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it("현재 월의 날짜들이 표시되어야 합니다", () => {
      render(<DatePicker />);

      for (let day = 13; day <= 27; day++) {
        expect(screen.getByText(String(day))).toBeInTheDocument();
      }
    });

    it("disabled 상태에서는 상호작용이 불가능해야 합니다", () => {
      const { container } = render(<DatePicker disabled />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("pointer-events-none");
      expect(wrapper).toHaveClass("opacity-50");
    });

    it("className prop이 적용되어야 합니다", () => {
      const { container } = render(<DatePicker className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("월 네비게이션", () => {
    it("이전 달 버튼을 클릭하면 이전 월로 이동해야 합니다", () => {
      render(<DatePicker />);

      const prevButton = screen.getByLabelText("이전 달");
      fireEvent.click(prevButton);

      expect(screen.getByText("2026.01")).toBeInTheDocument();
    });

    it("다음 달 버튼을 클릭하면 다음 월로 이동해야 합니다", () => {
      render(<DatePicker />);

      const nextButton = screen.getByLabelText("다음 달");
      fireEvent.click(nextButton);

      expect(screen.getByText("2026.03")).toBeInTheDocument();
    });

    it("여러 번 네비게이션이 가능해야 합니다", () => {
      render(<DatePicker />);

      const nextButton = screen.getByLabelText("다음 달");
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText("2026.04")).toBeInTheDocument();
    });
  });

  describe("날짜 선택", () => {
    it("선택 가능한 날짜를 클릭하면 선택되어야 합니다", () => {
      const onChange = jest.fn();
      render(<DatePicker onChange={onChange} />);

      const day15 = screen.getByText("15");
      fireEvent.click(day15);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: null,
        })
      );
    });

    it("시작일 선택 후 종료일을 선택하면 범위가 설정되어야 합니다", () => {
      const onChange = jest.fn();
      render(<DatePicker onChange={onChange} />);

      const day15 = screen.getByText("15");
      const day20 = screen.getByText("20");

      fireEvent.click(day15);
      fireEvent.click(day20);

      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      );
    });

    it("시작일보다 이전 날짜를 선택하면 날짜를 swap하여 범위가 설정되어야 합니다", () => {
      const onChange = jest.fn();
      render(<DatePicker onChange={onChange} />);

      const day20 = screen.getByText("20");
      const day15 = screen.getByText("15");

      fireEvent.click(day20);
      fireEvent.click(day15);

      // 20일 클릭 후 15일 클릭 시, startDate=15, endDate=20으로 swap
      expect(onChange).toHaveBeenCalledTimes(2);
      const lastCall = onChange.mock.calls[1][0];
      expect(lastCall.startDate.getDate()).toBe(15);
      expect(lastCall.endDate.getDate()).toBe(20);
    });
  });

  describe("날짜 비활성화", () => {
    it("과거 날짜는 비활성화되어야 합니다", () => {
      render(<DatePicker />);

      const day1 = screen.getByText("1");
      expect(day1.closest("button")).toBeDisabled();
    });

    it("2주 이후 날짜는 비활성화되어야 합니다", () => {
      render(<DatePicker />);

      const nextButton = screen.getByLabelText("다음 달");
      fireEvent.click(nextButton);

      const day1 = screen.getByText("1");
      expect(day1.closest("button")).toBeDisabled();
    });

    it("오늘부터 2주 이내 날짜는 활성화되어야 합니다", () => {
      render(<DatePicker />);

      const day13 = screen.getByText("13");
      const day27 = screen.getByText("27");

      expect(day13.closest("button")).not.toBeDisabled();
      expect(day27.closest("button")).not.toBeDisabled();
    });
  });

  describe("Controlled 모드", () => {
    it("value prop으로 선택된 범위를 표시해야 합니다", () => {
      const value: DateRange = {
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-20"),
      };

      render(<DatePicker value={value} />);

      const day15 = screen.getByText("15");
      const day20 = screen.getByText("20");

      expect(day15.closest("span")).toHaveClass("bg-green-500/10");
      expect(day20.closest("span")).toHaveClass("bg-green-500/10");
    });

    it("value가 변경되면 UI가 업데이트되어야 합니다", () => {
      const { rerender } = render(
        <DatePicker value={{ startDate: new Date("2026-02-15"), endDate: null }} />
      );

      const day15 = screen.getByText("15");
      expect(day15.closest("span")).toHaveClass("bg-green-500/10");

      rerender(<DatePicker value={{ startDate: new Date("2026-02-18"), endDate: null }} />);

      const day18 = screen.getByText("18");
      expect(day18.closest("span")).toHaveClass("bg-green-500/10");
    });
  });

  describe("Uncontrolled 모드", () => {
    it("defaultValue로 초기 범위를 설정할 수 있어야 합니다", () => {
      const defaultValue: DateRange = {
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-20"),
      };

      render(<DatePicker defaultValue={defaultValue} />);

      const day15 = screen.getByText("15");
      const day20 = screen.getByText("20");

      expect(day15.closest("span")).toHaveClass("bg-green-500/10");
      expect(day20.closest("span")).toHaveClass("bg-green-500/10");
    });

    it("내부 상태로 범위 선택이 관리되어야 합니다", () => {
      render(<DatePicker />);

      const day15 = screen.getByText("15");
      fireEvent.click(day15);

      expect(day15.closest("span")).toHaveClass("bg-green-500/10");
    });
  });

  describe("범위 표시", () => {
    it("시작일과 종료일 사이의 날짜들이 범위 스타일을 가져야 합니다", () => {
      const value: DateRange = {
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-18"),
      };

      render(<DatePicker value={value} />);

      const day16 = screen.getByText("16");
      const day17 = screen.getByText("17");

      expect(day16.closest("button")).toHaveClass("bg-alpha-white-8");
      expect(day17.closest("button")).toHaveClass("bg-alpha-white-8");
    });

    it("선택된 날짜(시작/종료)는 선택 스타일과 범위 스타일을 모두 가져야 합니다", () => {
      const value: DateRange = {
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-18"),
      };

      render(<DatePicker value={value} />);

      const day15 = screen.getByText("15");
      const day18 = screen.getByText("18");

      expect(day15.closest("button")).toHaveClass("bg-alpha-white-8");
      expect(day15.closest("span")).toHaveClass("bg-green-500/10");

      expect(day18.closest("button")).toHaveClass("bg-alpha-white-8");
      expect(day18.closest("span")).toHaveClass("bg-green-500/10");
    });
  });

  describe("오늘 날짜 표시", () => {
    it("오늘 날짜는 특별한 스타일을 가져야 합니다", () => {
      render(<DatePicker />);

      const today = screen.getByText("13");
      expect(today.closest("button")).toHaveClass("bg-alpha-white-16");
    });

    it("오늘 날짜가 선택되면 오늘 스타일 대신 선택 스타일이 적용되어야 합니다", () => {
      const value: DateRange = {
        startDate: new Date("2026-02-13"),
        endDate: null,
      };

      render(<DatePicker value={value} />);

      const today = screen.getByText("13");
      expect(today.closest("button")).not.toHaveClass("bg-alpha-white-16");
      expect(today.closest("span")).toHaveClass("bg-green-500/10");
    });
  });

  describe("날짜 표시 텍스트", () => {
    it("범위가 선택되지 않으면 오늘 날짜가 표시되어야 합니다", () => {
      render(<DatePicker />);

      expect(screen.getByText("26/02/13(금)")).toBeInTheDocument();
    });

    it("범위가 선택되면 선택된 범위가 표시되어야 합니다", () => {
      const value: DateRange = {
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-20"),
      };

      render(<DatePicker value={value} />);

      expect(screen.getByText(/26\/02\/15.*일.*~.*20.*금/)).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("네비게이션 버튼에 적절한 aria-label이 있어야 합니다", () => {
      render(<DatePicker />);

      expect(screen.getByLabelText("이전 달")).toBeInTheDocument();
      expect(screen.getByLabelText("다음 달")).toBeInTheDocument();
    });

    it("비활성화된 날짜 버튼은 disabled 속성을 가져야 합니다", () => {
      render(<DatePicker />);

      const day1 = screen.getByText("1");
      expect(day1.closest("button")).toHaveAttribute("disabled");
    });
  });
});
