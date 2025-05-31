import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  ThemeProvider,
  createTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DatePage from './DatePage';
import DefaultPage from './DefaultPage';
import TotalScorePage from './TotalScorePage';
import { SelectChangeEvent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginPage from './LoginPage';

// 모노톤 테마 생성
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          '&.MuiButton-contained': {
            backgroundColor: '#000000',
            '&:hover': {
              backgroundColor: '#333333',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#000000',
            color: '#000000',
            '&:hover': {
              borderColor: '#333333',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e0e0e0',
        },
      },
    },
  },
});

// 일요일만 반환하는 함수
type DateOption = { year: number; month: number; day: number };
function getSundays(year: number, month: number): number[] {
  const sundays: number[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (date.getDay() === 0) {
      sundays.push(date.getDate());
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [2025, 2026, 2027];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// 날짜 선택 드롭다운 컴포넌트 (공통화)
function DateDropdown({ label, value, onChange, options }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: number[];
}) {
  const renderValue = (selected: number) => {
    if (selected === 0) {
      return label === '일' ? '일' : label;
    }
    return selected.toString().padStart(2, '0');
  };

  return (
    <FormControl sx={{ minWidth: 120 }} size="small">
      <Select
        value={value}
        displayEmpty
        onChange={e => onChange(Number(e.target.value))}
        sx={{ 
          '& .MuiSelect-select': { 
            color: value ? 'inherit' : '#666'
          }
        }}
        renderValue={renderValue}
      >
        {options.map(opt => (
          <MenuItem key={opt} value={opt}>
            {opt.toString().padStart(2, '0')}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// 메인 페이지: 날짜 생성/이동/삭제, 전체 점수 집계 이동 등 관리
function MainPage() {
  const navigate = useNavigate();
  // 날짜 이동/생성용 상태
  const [moveYear, setMoveYear] = useState<number>(0);
  const [moveMonth, setMoveMonth] = useState<number>(0);
  const [moveDay, setMoveDay] = useState<number>(0);
  const [createYear, setCreateYear] = useState<number>(0);
  const [createMonth, setCreateMonth] = useState<number>(0);
  const [createDay, setCreateDay] = useState<number>(0);
  // 모달/알림 상태
  const [moveDateOpen, setMoveDateOpen] = useState(false);
  const [createDateOpen, setCreateDateOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [manageOpen, setManageOpen] = useState(false);
  // 생성된 날짜 목록 (localStorage 연동)
  const [createdDates, setCreatedDates] = useState<string[]>(() => {
    const savedDates = localStorage.getItem('createdDates');
    return savedDates ? JSON.parse(savedDates) : [];
  });
  React.useEffect(() => {
    localStorage.setItem('createdDates', JSON.stringify(createdDates));
  }, [createdDates]);
  // 연/월 변경 시 일요일 자동 갱신
  React.useEffect(() => {
    const sundays = getSundays(moveYear, moveMonth);
    if (!sundays.includes(moveDay)) setMoveDay(sundays[0] || 1);
  }, [moveYear, moveMonth]);
  React.useEffect(() => {
    const sundays = getSundays(createYear, createMonth);
    if (!sundays.includes(createDay)) setCreateDay(sundays[0] || 1);
  }, [createYear, createMonth]);
  // 날짜 포맷 변환
  const moveDateStr = `${moveYear}.${moveMonth.toString().padStart(2, '0')}.${moveDay.toString().padStart(2, '0')}`;
  const createDateStr = `${createYear}.${createMonth.toString().padStart(2, '0')}.${createDay.toString().padStart(2, '0')}`;
  // 날짜 생성
  const handleCreate = () => {
    if (createdDates.includes(createDateStr)) {
      setAlertMessage('이미 생성된 집계 입니다');
      setAlertOpen(true);
      return;
    }
    setCreatedDates([...createdDates, createDateStr]);
    setCreateDateOpen(false);
    navigate(`/date/${createDateStr}`);
  };
  // 날짜 이동
  const handleMove = () => {
    if (!createdDates.includes(moveDateStr)) {
      setAlertMessage('아직 생성되지 않은 집계 입니다');
      setAlertOpen(true);
      return;
    }
    setMoveDateOpen(false);
    navigate(`/date/${moveDateStr}`);
  };
  // 알림 닫기
  const handleAlertClose = () => setAlertOpen(false);
  // 모달 닫기 및 상태 초기화
  const handleMoveDateClose = () => { setMoveDateOpen(false); setMoveYear(0); setMoveMonth(0); setMoveDay(0); };
  const handleCreateDateClose = () => { setCreateDateOpen(false); setCreateYear(0); setCreateMonth(0); setCreateDay(0); };
  // 날짜 삭제 (localStorage 데이터도 함께 삭제)
  const handleDeleteDate = (dateStr: string) => {
    setCreatedDates(prev => prev.filter(d => d !== dateStr));
    localStorage.removeItem(`tables_${dateStr}`);
    localStorage.removeItem(`visitorTables_${dateStr}`);
    localStorage.removeItem(`scoreRows_${dateStr}`);
    localStorage.removeItem(`offeringTable_${dateStr}`);
  };
  // 전체 점수 집계 관련 상태
  const [totalScoreOpen, setTotalScoreOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const years = ['2025', '2026', '2027'];
  const handleTotalScoreClick = () => setTotalScoreOpen(true);
  const handleTotalScoreClose = () => setTotalScoreOpen(false);
  const handleTotalScoreConfirm = () => {
    if (selectedYear) {
      setTotalScoreOpen(false);
      navigate(`/total-score/${selectedYear}`);
    }
  };
  // 연도 선택 핸들러
  const handleYearChange = (event: SelectChangeEvent) => setSelectedYear(event.target.value);

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            중등부 교적 시스템
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => {
              // 인증 관련 데이터만 삭제
              localStorage.removeItem('isLoggedIn');
              // 다른 데이터는 유지
              navigate('/login');
            }}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            로그아웃
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setMoveDateOpen(true)}
            sx={{ width: 160, height: 44, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2, boxShadow: 3 }}
          >
            집계 날짜 (이동)
          </Button>

          <Button
            variant="contained"
            onClick={() => setCreateDateOpen(true)}
            sx={{ width: 160, height: 44, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2, boxShadow: 3 }}
          >
            집계 날짜 (생성)
          </Button>

          <Button
            variant="contained"
            onClick={handleTotalScoreClick}
            sx={{ width: 160, height: 44, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2, boxShadow: 3 }}
          >
            총 점수 (이동)
          </Button>
        </Box>
        {/* 오른쪽 아래 날짜 관리 버튼 */}
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }}>
          <Button variant="contained" color="secondary" onClick={() => setManageOpen(true)}>
            날짜 관리
          </Button>
        </Box>
        {/* 날짜 관리 모달 */}
        <Dialog open={manageOpen} onClose={() => setManageOpen(false)}>
          <DialogTitle>생성된 날짜 관리</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 320 }}>
              {createdDates.length === 0 ? (
                <Typography sx={{ my: 2 }}>생성된 날짜가 없습니다.</Typography>
              ) : (
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {createdDates.map(date => (
                    <Box component="li" key={date} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                      <Typography>{date} 집계</Typography>
                      <IconButton color="error" onClick={() => handleDeleteDate(date)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManageOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* 집계 날짜 (이동) 팝업 */}
      <Dialog open={moveDateOpen} onClose={handleMoveDateClose}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          집계 날짜 (이동)
          <IconButton onClick={handleMoveDateClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <DateDropdown label="연도" value={moveYear} onChange={setMoveYear} options={YEARS} />
            <DateDropdown label="월" value={moveMonth} onChange={setMoveMonth} options={MONTHS} />
            <DateDropdown label="일" value={moveDay} onChange={setMoveDay} options={getSundays(moveYear, moveMonth)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMove}>확인</Button>
        </DialogActions>
      </Dialog>

      {/* 집계 날짜 (생성) 팝업 */}
      <Dialog open={createDateOpen} onClose={handleCreateDateClose}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          집계 날짜 (생성)
          <IconButton onClick={handleCreateDateClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <DateDropdown label="연도" value={createYear} onChange={setCreateYear} options={YEARS} />
            <DateDropdown label="월" value={createMonth} onChange={setCreateMonth} options={MONTHS} />
            <DateDropdown label="일" value={createDay} onChange={setCreateDay} options={getSundays(createYear, createMonth)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreate}>생성</Button>
        </DialogActions>
      </Dialog>

      {/* 알림 팝업 */}
      <Dialog open={alertOpen} onClose={handleAlertClose}>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {alertMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose}>확인</Button>
        </DialogActions>
      </Dialog>

      {/* 총 점수 연도 선택 팝업 */}
      <Dialog open={totalScoreOpen} onClose={handleTotalScoreClose} PaperProps={{ sx: { minWidth: '300px' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          총 점수 (이동)
          <IconButton onClick={handleTotalScoreClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, justifyContent: 'center' }}>
            <DateDropdown label="연도" value={Number(selectedYear)} onChange={(year) => setSelectedYear(year.toString())} options={years.map(Number)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTotalScoreClose}>취소</Button>
          <Button onClick={handleTotalScoreConfirm} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// 인증 체크를 위한 컴포넌트
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/main" element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          } />
          <Route path="/date/:date" element={
            <PrivateRoute>
              <DatePage />
            </PrivateRoute>
          } />
          <Route path="/total-score/:year" element={
            <PrivateRoute>
              <TotalScorePage />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 