import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

const MainPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [totalScoreOpen, setTotalScoreOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [createdDates, setCreatedDates] = useState<string[]>([]);

  // 현재 연도 기준으로 5년 전부터 5년 후까지의 연도 목록 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  useEffect(() => {
    const savedDates = localStorage.getItem('createdDates');
    if (savedDates) {
      setCreatedDates(JSON.parse(savedDates));
    }
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTotalScoreClick = () => {
    setTotalScoreOpen(true);
  };

  const handleTotalScoreClose = () => {
    setTotalScoreOpen(false);
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value);
  };

  const handleDayChange = (event: SelectChangeEvent) => {
    setSelectedDay(event.target.value);
  };

  const handleConfirm = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const date = `${selectedYear}-${selectedMonth}-${selectedDay}`;
      if (createdDates.includes(date)) {
        alert('이미 생성된 날짜입니다.');
      } else {
        const newDates = [...createdDates, date];
        setCreatedDates(newDates);
        localStorage.setItem('createdDates', JSON.stringify(newDates));
        window.location.href = `/date/${date}`;
      }
      setOpen(false);
    }
  };

  const handleTotalScoreConfirm = () => {
    if (selectedYear) {
      setTotalScoreOpen(false);
      window.location.href = `/total-score/${selectedYear}`;
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Button
          variant="contained"
          onClick={handleClickOpen}
          sx={{ minWidth: 200, mb: 2 }}
        >
          날짜 집계
        </Button>
        <Button
          variant="contained"
          onClick={handleTotalScoreClick}
          sx={{ minWidth: 200 }}
        >
          총점수
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>날짜 선택</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="year-select-label">연도</InputLabel>
              <Select
                labelId="year-select-label"
                value={selectedYear}
                label="연도"
                onChange={handleYearChange}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="month-select-label">월</InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                label="월"
                onChange={handleMonthChange}
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}월
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="day-select-label">일</InputLabel>
              <Select
                labelId="day-select-label"
                value={selectedDay}
                label="일"
                onChange={handleDayChange}
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}일
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleConfirm} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={totalScoreOpen} onClose={handleTotalScoreClose}>
        <DialogTitle>연도 선택</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl>
              <InputLabel>연도</InputLabel>
              <Select
                value={selectedYear}
                label="연도"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTotalScoreClose}>취소</Button>
          <Button onClick={handleTotalScoreConfirm} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MainPage; 