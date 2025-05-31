import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ClassData {
  name: string;
  teacher: string;
}

interface ScoreData {
  [key: string]: {
    [className: string]: number;
  };
}

// 월별 일요일 날짜 생성 함수
function getSundays(year: number, month: number): string[] {
  const sundays: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (date.getDay() === 0) {
      sundays.push(date.getDate().toString().padStart(2, '0'));
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

// 연도별 전체 점수 집계 페이지
function TotalScorePage() {
  const { year } = useParams();
  const navigate = useNavigate();
  // 점수 데이터 상태
  const [scoreData, setScoreData] = useState<ScoreData>({});
  // 반/교사 정보 블록 상태
  const [classBlocks, setClassBlocks] = useState<{ class: string; teacher: string; students: any[]; groupIndex: number }[]>([]);
  const yearNum = year ? parseInt(year) : new Date().getFullYear();
  // 월별 분할
  const months1 = [1, 2, 3, 4];
  const months2 = [5, 6, 7, 8];
  const months3 = [9, 10, 11, 12];
  // 월별 일요일 날짜
  const monthSundays1 = months1.map((m) => getSundays(yearNum, m));
  const monthSundays2 = months2.map((m) => getSundays(yearNum, m));
  const monthSundays3 = months3.map((m) => getSundays(yearNum, m));
  // 월별 colspan 계산
  const monthColspans1 = monthSundays1.map((s) => s.length + 1); // +1은 합산
  const monthColspans2 = monthSundays2.map((s) => s.length + 1);
  const monthColspans3 = monthSundays3.map((s) => s.length + 1);
  // 전체 헤더 열 개수 계산
  const totalCols1 = 2 + monthColspans1.reduce((a, b) => a + b, 0); // 2: 반/교사
  const totalCols2 = 2 + monthColspans2.reduce((a, b) => a + b, 0);
  const totalCols3 = 2 + monthColspans3.reduce((a, b) => a + b, 0);
  // 월별 일요일 전체 리스트
  const allMonthSundays = Array.from({length: 12}, (_, i) => getSundays(yearNum, i + 1));
  // 최고 점수 입력값 상태 (믿음/소망/사랑, 월별, 줄별)
  const [manualScores, setManualScores] = useState<{ [year: number]: { [month: number]: { faith: string; hope: string; love: string } } }>({});
  const didLoadManualScores = useRef(false);
  // 최초 마운트 시 localStorage에서 불러오기 (단 한 번만)
  useEffect(() => {
    if (!didLoadManualScores.current) {
      const saved = localStorage.getItem('manualScores');
      if (saved) setManualScores(JSON.parse(saved));
      didLoadManualScores.current = true;
    }
  }, []);
  // manualScores가 바뀔 때만 localStorage에 저장
  useEffect(() => {
    if (didLoadManualScores.current) localStorage.setItem('manualScores', JSON.stringify(manualScores));
  }, [manualScores]);
  // 최고 점수 입력 핸들러
  const handleManualScoreChange = (month: number, field: 'faith' | 'hope' | 'love', value: string) => {
    setManualScores(prev => ({
      ...prev,
      [yearNum]: {
        ...prev[yearNum],
        [month]: {
          ...prev[yearNum]?.[month],
          [field]: value
        }
      }
    }));
  };
  // 연도 첫 날짜 집계에서 반/교사 명단 불러오기
  useEffect(() => {
    function loadClassBlocks() {
      const createdDates = JSON.parse(localStorage.getItem('createdDates') || '[]');
      const yearDates = createdDates.filter((date: string) => date.startsWith((year ?? '') + '.'));
      if (yearDates.length > 0) {
        const firstDate = yearDates[0];
        // 출석 집계 데이터 불러오기
        const tables = JSON.parse(localStorage.getItem(`tables_${firstDate}`) || '[]');
        // 모든 rows를 flat하게 순회하여 반/교사 정보 추출 (groupIndex 추가)
        const blocks: { class: string; teacher: string; students: any[]; groupIndex: number }[] = [];
        tables.forEach((table: any, tableIdx: number) => {
          if (Array.isArray(table.rows)) {
            table.rows.forEach((row: any) => {
              const className = row.class || row.className || row.name || row.반이름 || table.class || table.className || table.name || table.반이름 || 'NO_CLASS';
              const teacher = row.teacher || row.teacherName || row.교사 || table.teacher || table.teacherName || table.교사 || 'NO_TEACHER';
              // '새신자'가 포함된 반은 제외
              if (className.includes('새신자')) return;
              // 이미 blocks에 같은 반이 있으면 추가하지 않음
              if (!blocks.some(b => b.class === className && b.teacher === teacher)) {
                blocks.push({ class: className, teacher, students: [], groupIndex: tableIdx });
              }
            });
          }
        });
        setClassBlocks(blocks);
      }
    }
    loadClassBlocks();
    // storage/커스텀 이벤트 리스너 등록
    function handleStorage(e: StorageEvent) {
      if (!e.key || e.key.startsWith('tables_') || e.key === 'createdDates') loadClassBlocks();
    }
    function handleCustomUpdate() { loadClassBlocks(); }
    window.addEventListener('storage', handleStorage);
    window.addEventListener('updateClassBlocks', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('updateClassBlocks', handleCustomUpdate);
    };
  }, [year]);
  // 메인화면 이동
  const handleMainPage = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    navigate('/main');
  };
  // 반 이름에 따른 점수 반환
  const getScore = (className: string, month: number) => {
    const monthData = scoreData[month];
    if (!monthData) return 0;
    return monthData[className] || 0;
  };
  // 날짜 포맷: yyyy.mm.dd, 월별 일요일 날짜 리스트 생성
  const monthSundayDates = (year: number, month: number) => {
    const sundays = getSundays(year, month);
    return sundays.map(day => `${year}.${month.toString().padStart(2, '0')}.${day}`);
  };
  // 점수 가져오기 함수
  function getScoreForDate(block: { class: string; teacher: string }, date: string) {
    const scoreRowsRaw = JSON.parse(localStorage.getItem(`scoreRows_${date}`) || '[]');
    const scoreRows = Array.isArray(scoreRowsRaw[0]) ? scoreRowsRaw.flat() : scoreRowsRaw;
    const row = scoreRows.find((r: any) =>
      (r.class === block.class || r.className === block.class || r.name === block.class || r.반이름 === block.class) &&
      (r.teacher === block.teacher || r.teacherName === block.teacher || r.교사 === block.teacher)
    );
    if (!row) return '';
    return row.sum || '';
  }
  // 테이블+박스 쌍으로 반환하도록 수정
  const renderTable = (months: number[], monthSundays: string[][], monthColspans: number[], totalCols: number, blocks: any[]) => {
    // 각 월별, 그룹별 최고 점수와 해당 반/교사 정보 계산
    const monthMaxScores = months.map((m, mIdx) => {
      const dates = monthSundayDates(yearNum, m);
      const groupMaxScores = [0, 0, 0];
      const groupMaxInfo = [
        { class: '', teacher: '' },
        { class: '', teacher: '' },
        { class: '', teacher: '' }
      ];
      blocks.forEach(block => {
        let monthSum = 0;
        dates.forEach(date => {
          const score = getScoreForDate(block, date);
          if (score !== '') {
            const scoreNum = parseFloat(score);
            if (!isNaN(scoreNum)) {
              monthSum += scoreNum;
            }
          }
        });
        if (monthSum > groupMaxScores[block.groupIndex]) {
          groupMaxScores[block.groupIndex] = monthSum;
          groupMaxInfo[block.groupIndex] = { class: block.class, teacher: block.teacher };
        }
      });
      return { scores: groupMaxScores, info: groupMaxInfo };
    });

    return (
      <>
        <TableContainer component={Paper} sx={{ mb: 0, backgroundColor: '#fff' }}>
          <Table size="small">
            <TableHead>
              {/* 월 헤더 */}
              <TableRow>
                <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>반</TableCell>
                <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>교사</TableCell>
                {months.map((m, idx) => (
                  <TableCell key={`month-header-${m}-${idx}`} align="center" colSpan={monthColspans[idx]} sx={{ fontWeight: 'bold', minWidth: 40 * monthColspans[idx] }}>{m}월</TableCell>
                ))}
              </TableRow>
              {/* 일요일 날짜 + 합산 */}
              <TableRow>
                {monthSundays.map((sundays, mIdx) => (
                  <React.Fragment key={`sundays-frag-${months[mIdx]}-${mIdx}`}> 
                    {sundays.map((d, dIdx) => (
                      <TableCell key={`sunday-${months[mIdx]}-${d}-${dIdx}`} align="center">{d}</TableCell>
                    ))}
                    <TableCell key={`sum-${months[mIdx]}-${mIdx}`} align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 40 }}>총점</TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((block, idx) => {
                const prevGroup = idx > 0 ? blocks[idx - 1].groupIndex : block.groupIndex;
                return (
                  <React.Fragment key={`${block.class}-${idx}`}>
                    {idx !== 0 && block.groupIndex !== prevGroup && (
                      <TableRow key={`divider-${block.class}-${idx}`}>
                        <TableCell colSpan={totalCols} sx={{ borderBottom: '2px solid #bbb', p: 0 }} />
                      </TableRow>
                    )}
                    {/* 반 헤더: students[0] */}
                    <TableRow key={`header-${block.class}-${idx}`}>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>{block.class}</TableCell>
                      <TableCell align="center">{block.teacher}</TableCell>
                      {months.map((m, mIdx) => {
                        // 해당 월의 일요일 날짜 리스트
                        const dates = monthSundayDates(yearNum, m);
                        // 월별 합산
                        let monthSum = 0;
                        return (
                          <React.Fragment key={`frag-${block.class}-${idx}-${m}-${mIdx}`}>
                            {dates.map((date, dIdx) => {
                              const score = getScoreForDate(block, date);
                              // 문자열 점수도 숫자로 변환하여 더하기
                              if (score !== '') {
                                const scoreNum = parseFloat(score);
                                if (!isNaN(scoreNum)) {
                                  monthSum += scoreNum;
                                }
                              }
                              return (
                                <TableCell key={`cell-${block.class}-${idx}-${m}-${mIdx}-${dIdx}`} align="center">{score}</TableCell>
                              );
                            })}
                            <TableCell 
                              key={`sumcell-${block.class}-${idx}-${m}-${mIdx}`} 
                              align="center" 
                              sx={{ 
                                bgcolor: monthSum > 0 && monthSum === monthMaxScores[mIdx].scores[block.groupIndex] ? '#ffafb0' : '#f5f5f5',
                                minWidth: 40,
                                fontWeight: monthSum > 0 && monthSum === monthMaxScores[mIdx].scores[block.groupIndex] ? 'bold' : 'normal'
                              }}
                            >
                              {monthSum > 0 ? monthSum : ''}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                    </TableRow>
                    {/* 학생/교사 행: students[1]부터 (점수는 비워둠) */}
                    {block.students.slice(1).map((student: any, sIdx: number) => (
                      <TableRow key={`student-${block.class}-${idx}-${sIdx + 1}`}>
                        <TableCell colSpan={2} align="center"></TableCell>
                        {months.map((m, mIdx) => (
                          <React.Fragment key={`frag-student-${block.class}-${idx}-${sIdx + 1}-${m}-${mIdx}`}> 
                            {monthSundayDates(yearNum, m).map((date, dIdx) => (
                              <TableCell key={`cell-student-${block.class}-${idx}-${sIdx + 1}-${m}-${mIdx}-${dIdx}`} align="center"></TableCell>
                            ))}
                            <TableCell key={`sumcell-student-${block.class}-${idx}-${sIdx + 1}-${m}-${mIdx}`} align="center" sx={{ bgcolor: '#f5f5f5', minWidth: 40 }}/> 
                          </React.Fragment>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
              {/* 각 월 합산 열 아래에 최고 점수 정보 행 - 3줄(믿음/소망/사랑)로 나누고 입력란 추가, 첫 줄 왼쪽에만 우승반 표시 */}
              {[0, 1, 2].map((rowIdx) => (
                <TableRow key={`maxscore-row-${rowIdx}`}>
                  {rowIdx === 0 ? (
                    <TableCell rowSpan={3} colSpan={2} align="center" sx={{ bgcolor: '#f5f5f5', color: '#222', fontWeight: 'bold', fontSize: '1.2rem', borderRight: '2px solid #eee' }}>
                      우승반
                    </TableCell>
                  ) : null}
                  {rowIdx !== 0 && <></>}
                  {months.map((m, localIdx) => {
                    const thisColspan = allMonthSundays[m-1].length + 1;
                    const field = rowIdx === 0 ? 'faith' : rowIdx === 1 ? 'hope' : 'love';
                    const label = rowIdx === 0 ? '믿음' : rowIdx === 1 ? '소망' : '사랑';
                    return (
                      <TableCell
                        key={`maxcell-${m}-row${rowIdx}`}
                        align="center"
                        colSpan={thisColspan}
                        sx={{
                          bgcolor: '#f5f5f5',
                          fontWeight: 'bold',
                          fontSize: 13,
                          borderTop: rowIdx === 0 ? '1.5px solid #e0e0e0' : undefined,
                          p: 0.5,
                          borderLeft: localIdx > 0 ? '2px solid #bbb' : undefined,
                          height: 32,
                        }}
                      >
                        <TextField
                          size="small"
                          variant="standard"
                          value={manualScores[yearNum]?.[m]?.[field] || ''}
                          onChange={e => handleManualScoreChange(m, field as any, e.target.value)}
                          placeholder={label}
                          sx={{ width: 100, background: 'transparent', px: 0, mx: 0, textAlign: 'center' }}
                          InputProps={{ disableUnderline: true }}
                          inputProps={{ style: { textAlign: 'center', fontWeight: 'bold' } }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#ffffff' }}>{year}년 총점수</Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/main')}
            sx={{ backgroundColor: '#333333', color: '#ffffff', '&:hover': { backgroundColor: '#444444' } }}
          >
            메인화면
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3, maxWidth: '100% !important', backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          {renderTable(months1, monthSundays1, monthColspans1, totalCols1, classBlocks)}
          {renderTable(months2, monthSundays2, monthColspans2, totalCols2, classBlocks)}
          {renderTable(months3, monthSundays3, monthColspans3, totalCols3, classBlocks)}
        </Box>
      </Container>
    </div>
  );
}

export default TotalScorePage; 