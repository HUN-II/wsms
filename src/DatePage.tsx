import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Fab from '@mui/material/Fab';

// 타입 정의 추가
interface TableRowData {
  class: string;
  teacher: string;
  students: string[];
  attends: boolean[]; // 출석 상태
  total: string;
  attend: string;
}

interface TableState {
  rows: TableRowData[];
  edit: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 새신자반 테이블 타입 정의
interface VisitorTableRowData {
  students: string[];
  attends: boolean[];
}
interface VisitorTableState {
  rows: VisitorTableRowData[];
  edit: boolean;
}

// 점수 집계용 상태 타입 정의
interface ScoreRowData {
  class: string;
  teacher: string;
  total: number;
  attend: string;
  pray: string;
  call: string;
  dim5: string;
  evangel: string;
  bible: string;
  internal: string;
  sum: string;
}

// 헌금 집계용 타입 정의
interface OfferingRowData {
  type: string; // 구분
  names: string[][]; // 10행*2열
  amount: string; // 금액
}
interface OfferingTableState {
  rows: OfferingRowData[];
}

const OFFERING_TYPES = [
  '주일헌금',
  '감사헌금',
  '십일조',
  '일천번제헌금',
  '선교헌금',
  '특별헌금',
];

// TextField 공통 스타일
const noBoxTextFieldProps = {
  variant: 'standard' as const,
  InputProps: {
    disableUnderline: true,
  },
  sx: {
    minWidth: 0,
    background: 'transparent',
    p: 0,
    m: 0,
    '& .MuiInputBase-root': {
      p: 0,
      m: 0,
      background: 'transparent',
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
    },
    '& input': {
      p: 0,
      m: 0,
      background: 'transparent',
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
      fontSize: '1rem',
      textAlign: 'center',
      color: '#000000',
    },
  },
};

// 점수 집계 칸 넓이 상수 (label별로 지정, 필요시 여기서 수정)
const SCORE_COL_WIDTHS: { [label: string]: number } = {
  반: 40,
  교사: 40,
  재적: 40,
  출석: 40,
  기도회: 50,
  전화심방: 50,
  '5차원': 50,
  전도: 50,
  성경읽기: 50,
  내면화: 50,
  총점: 60,
};

interface DatePageProps {
  date?: string;
}

function calcSum(row: ScoreRowData, scoreSettings: { label: string; value: string }[], scoreAttendanceValue: string) {
  // 출석 점수 먼저 더함
  let sum = 0;
  const attendScore = parseFloat(scoreAttendanceValue) || 0;
  const attendCount = parseFloat(row.attend) || 0;
  sum += attendScore * attendCount;
  // 나머지 항목 계산
  sum += scoreSettings.reduce((acc, setting) => {
    let value = String(row[setting.label.toLowerCase() as keyof typeof row] ?? '');
    const score = parseFloat(value) || 0;
    const multiplier = setting.value === '' ? 1 : (parseFloat(setting.value) || 0);
    return acc + (score * multiplier);
  }, 0);
  return Math.round(sum).toString();
}

// DatePage: 날짜별 출석/점수/헌금 집계 및 관리 페이지
// 주요 상태와 함수, 컴포넌트별로 한글 주석 추가
// 불필요한 변수/미사용 import 정리 및 코드 스타일 통일

function DatePage(props: DatePageProps) {
  const params = useParams();
  const date = props.date ?? params.date;
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // 각 테이블의 행 데이터와 수정 모드 상태 관리 (타입 명시)
  const [tables, setTables] = useState<TableState[]>(() => {
    const saved = localStorage.getItem(`tables_${date}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // students가 배열이 아니면 빈 배열로 보정
        return parsed.map((table: any) => ({
          ...table,
          rows: table.rows.map((row: any) => ({
            ...row,
            students: Array.isArray(row.students) ? row.students : Array(10).fill(''),
          })),
        }));
      } catch {
        // 파싱 실패 시 기본값
      }
    }
    return [
      { rows: [], edit: false },
      { rows: [], edit: false },
      { rows: [], edit: false },
    ];
  });
  useEffect(() => {
    if (date) localStorage.setItem(`tables_${date}`, JSON.stringify(tables));
  }, [tables, date]);

  const tableNames = ['믿음', '소망', '사랑'];

  const tableColors = [
    { font: '#fcffb0', bg: '#fcffb0' }, // 믿음 
    { font: '#ccffcc', bg: '#ccffcc' }, // 소망
    { font: '#c4fd4e', bg: '#cce5ff' }, // 사랑 
  ];

  // 새신자반 테이블 상태
  const [visitorTables, setVisitorTables] = useState<VisitorTableState[]>(() => {
    const saved = localStorage.getItem(`visitorTables_${date}`);
    return saved ? JSON.parse(saved) : [ { rows: [], edit: false } ];
  });
  useEffect(() => {
    if (date) localStorage.setItem(`visitorTables_${date}`, JSON.stringify(visitorTables));
  }, [visitorTables, date]);

  // 학생 테이블용 재적/출석 카운트 계산 (모든 반 + 새신자반 합산)
  const totalStudents =
    tables.reduce((sum, table) => sum + table.rows.reduce((s, row) => s + row.students.filter((name) => name.trim() !== '').length, 0), 0)
    + visitorTables.reduce((sum, table) => sum + table.rows.reduce((s, row) => s + row.students.filter((name) => name.trim() !== '').length, 0), 0);
  const totalAttends =
    tables.reduce((sum, table) => sum + table.rows.reduce((s, row) => s + row.students.filter((name, idx) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length, 0), 0)
    + visitorTables.reduce((sum, table) => sum + table.rows.reduce((s, row) => s + row.students.filter((name, idx) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length, 0), 0);

  // 학생 테이블용 상태
  const [studentTotal, setStudentTotal] = useState(() => localStorage.getItem('studentTotal') || '');
  const [studentAttend, setStudentAttend] = useState(() => localStorage.getItem('studentAttend') || '');
  useEffect(() => {
    localStorage.setItem('studentTotal', studentTotal);
  }, [studentTotal]);
  useEffect(() => {
    localStorage.setItem('studentAttend', studentAttend);
  }, [studentAttend]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 행 추가
  const handleAddRow = (tableIdx: number) => {
    setTables(prev => prev.map((table, idx) =>
      idx === tableIdx
        ? { ...table, rows: [...table.rows, { class: '', teacher: '', students: Array(10).fill(''), attends: Array(10).fill(false), total: '', attend: '' }] }
        : table
    ));
  };

  // 행 삭제
  const handleDeleteRow = (tableIdx: number, rowIdx: number) => {
    setTables(prev => prev.map((table, idx) =>
      idx === tableIdx
        ? { ...table, rows: table.rows.filter((_, i) => i !== rowIdx) }
        : table
    ));
  };

  // 수정 모드 토글
  const handleEditToggle = (tableIdx: number) => {
    setTables(prev => prev.map((table, idx) =>
      idx === tableIdx ? { ...table, edit: !table.edit } : table
    ));
  };

  const handleVisitorAddRow = (tableIdx: number) => {
    setVisitorTables(prev => prev.map((table, idx) =>
      idx === tableIdx
        ? { ...table, rows: [...table.rows, { students: Array(10).fill(''), attends: Array(10).fill(false) }] }
        : table
    ));
  };

  const handleVisitorDeleteRow = (tableIdx: number, rowIdx: number) => {
    setVisitorTables(prev => prev.map((table, idx) =>
      idx === tableIdx
        ? { ...table, rows: table.rows.filter((_, i) => i !== rowIdx) }
        : table
    ));
  };

  const handleVisitorEditToggle = (tableIdx: number) => {
    setVisitorTables(prev => prev.map((table, idx) =>
      idx === tableIdx ? { ...table, edit: !table.edit } : table
    ));
  };

  // 출석 통계 테이블 데이터 계산
  const statRows = [
    {
      label: '믿음',
      total: tables[0]?.rows.reduce((s, row) => s + row.students.filter((name) => name.trim() !== '').length, 0) || 0,
      attend: tables[0]?.rows.reduce((s, row) => s + row.students.filter((name, idx) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length, 0) || 0,
    },
    {
      label: '소망',
      total: tables[1]?.rows.reduce((s, row) => s + row.students.filter((name) => name.trim() !== '').length, 0) || 0,
      attend: tables[1]?.rows.reduce((s, row) => s + row.students.filter((name, idx) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length, 0) || 0,
    },
    {
      label: '사랑',
      total: tables[2]?.rows.reduce((s, row) => s + row.students.filter((name) => name.trim() !== '').length, 0) || 0,
      attend: tables[2]?.rows.reduce((s, row) => s + row.students.filter((name, idx) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length, 0) || 0,
    },
    {
      label: '새친구',
      total: visitorTables[0]?.rows.reduce((s, row) => s + row.students.filter((name) => name.trim() !== '').length, 0) || 0,
      attend: visitorTables[0]?.rows.reduce((s, row) => s + row.students.filter((name, idx) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length, 0) || 0,
    },
    {
      label: '학생',
      total: totalStudents,
      attend: totalAttends,
    },
    {
      label: '교사',
      total: 0,
      attend: 0,
    },
  ];

  // 출석 통계 테이블 수정 상태
  const [statEdit, setStatEdit] = useState(false);
  const [statRowsState, setStatRowsState] = useState(() => statRows.map(row => ({ ...row })));
  useEffect(() => { setStatRowsState(statRows.map(row => ({ ...row }))); }, [tables, visitorTables, totalStudents, totalAttends]);

  // 점수 설정 테이블 상태
  const [scoreSettingEdit, setScoreSettingEdit] = useState(false);
  const [scoreSettings, setScoreSettings] = useState<{ label: string; value: string }[]>(() => {
    if (!date) return [];
    const saved = localStorage.getItem(`scoreSettings_${date}`);
    let base = [
      { label: '기도회', value: '' },
      { label: '전화심방', value: '' },
      { label: '5차원', value: '' },
      { label: '전도', value: '' },
      { label: '성경읽기', value: '' },
      { label: '내면화', value: '' },
    ];
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        // 출석 항목은 항상 제외하고 나머지만 불러옴
        return loaded.filter((row: any) => row.label !== '출석');
      } catch {
        return base;
      }
    }
    return base;
  });

  // 출석 점수 상태
  const [scoreAttendanceValue, setScoreAttendanceValue] = useState(() => {
    if (!date) return '';
    const saved = localStorage.getItem(`scoreSettings_${date}`);
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        const found = loaded.find((row: any) => row.label === '출석');
        return found ? found.value : '';
      } catch {
        return '';
      }
    }
    return '';
  });

  // 출석 점수 변경 핸들러
  const handleScoreAttendanceChange = (value: string) => {
    setScoreAttendanceValue(value);
  };

  // scoreSettings, scoreAttendanceValue가 바뀔 때 localStorage에 저장
  useEffect(() => {
    if (!date) return;
    const toSave = [{ label: '출석', value: scoreAttendanceValue }, ...scoreSettings];
    localStorage.setItem(`scoreSettings_${date}`, JSON.stringify(toSave));
  }, [scoreSettings, scoreAttendanceValue, date]);

  // 점수 집계용 상태
  const [scoreRows, setScoreRows] = useState<ScoreRowData[][]>(() => {
    if (!date) return [];
    const saved = localStorage.getItem(`scoreRows_${date}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 저장된 데이터가 있으면 그대로 사용
        return parsed;
      } catch {
        // 파싱 실패 시 빈 배열 반환
        return [];
      }
    }
    // 저장된 데이터가 없으면 빈 배열 반환
    return [];
  });

  // tables가 변경될 때 scoreRows 초기화 또는 업데이트
  useEffect(() => {
    if (!date || tables.length === 0) return;

    const saved = localStorage.getItem(`scoreRows_${date}`);
    let existingData: ScoreRowData[][] = [];
    
    if (saved) {
      try {
        existingData = JSON.parse(saved);
      } catch {
        existingData = [];
      }
    }

    const newScoreRows = tables.map((table, tableIdx) =>
      table.rows.map((row, rowIdx) => {
        const attendCount = row.students.filter((name: string, idx: number) => 
          name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]
        ).length.toString();

        // 기존 데이터가 있으면 그대로 사용하되 출석은 업데이트
        const existingRow = existingData[tableIdx]?.[rowIdx];
        if (existingRow) {
          const updatedRow = {
            ...existingRow,
            class: row.class,
            teacher: row.teacher,
            total: row.students.filter((name: string) => name.trim() !== '').length,
            attend: attendCount,
          };
          return {
            ...updatedRow,
            sum: calcSum(updatedRow, scoreSettings, scoreAttendanceValue)
          };
        }

        // 기존 데이터가 없으면 새로 생성
        const newRow = {
          class: row.class,
          teacher: row.teacher,
          total: row.students.filter((name: string) => name.trim() !== '').length,
          attend: attendCount,
          pray: '',
          call: '',
          dim5: '',
          evangel: '',
          bible: '',
          internal: '',
          sum: '',
        };
        return {
          ...newRow,
          sum: calcSum(newRow, scoreSettings, scoreAttendanceValue)
        };
      })
    );

    setScoreRows(newScoreRows);
    localStorage.setItem(`scoreRows_${date}`, JSON.stringify(newScoreRows));
  }, [tables, date, scoreSettings, scoreAttendanceValue]);

  // 출석 체크 시 scoreRows 업데이트
  useEffect(() => {
    if (!date || tables.length === 0) return;

    setScoreRows(prevScoreRows => {
      const newScoreRows = prevScoreRows.map((table, tableIdx) =>
        table.map((row, rowIdx) => {
          const attendCount = tables[tableIdx].rows[rowIdx].students.filter(
            (name: string, idx: number) => name.trim() !== '' && (tables[tableIdx].rows[rowIdx].attends ?? Array(10).fill(false))[idx]
          ).length.toString();

          return {
            ...row,
            attend: attendCount,
            sum: calcSum({ ...row, attend: attendCount }, scoreSettings, scoreAttendanceValue)
          };
        })
      );

      localStorage.setItem(`scoreRows_${date}`, JSON.stringify(newScoreRows));
      return newScoreRows;
    });
  }, [tables.map(table => table.rows.map(row => row.attends)).flat(2), date, scoreSettings, scoreAttendanceValue]);

  // 점수 입력 핸들러
  const handleScoreChange = (tableIdx: number, rowIdx: number, field: keyof ScoreRowData, value: string) => {
    setScoreRows(prevScoreRows => {
      const newScoreRows = prevScoreRows.map((table, tIdx) =>
        tIdx === tableIdx
          ? table.map((row, rIdx) =>
              rIdx === rowIdx
                ? {
                    ...row,
                    [field]: value,
                    sum: calcSum({ ...row, [field]: value }, scoreSettings, scoreAttendanceValue)
                  }
                : row
            )
          : table
      );
      
      if (date) {
        localStorage.setItem(`scoreRows_${date}`, JSON.stringify(newScoreRows));
      }
      return newScoreRows;
    });
  };

  // scoreSettings가 변경될 때 sum 재계산
  useEffect(() => {
    if (scoreRows.length === 0) return;
    
    const newScoreRows = scoreRows.map(table =>
      table.map(row => ({
        ...row,
        sum: calcSum(row, scoreSettings, scoreAttendanceValue)
      }))
    );
    
    setScoreRows(newScoreRows);
    if (date) {
      localStorage.setItem(`scoreRows_${date}`, JSON.stringify(newScoreRows));
    }
  }, [scoreSettings, date, scoreAttendanceValue]);

  // 점수 집계 고정 항목
  const scoreFixedHeaders = ['반', '교사', '재적'];

  // 점수 집계 테이블 상태
  const [scoreTableEdit, setScoreTableEdit] = useState<boolean[]>([false, false, false]);

  // 점수 집계 테이블 수정 모드 토글
  const handleScoreTableEditToggle = (tableIdx: number) => {
    setScoreTableEdit(prev => prev.map((edit, idx) => idx === tableIdx ? !edit : edit));
  };

  // 헌금 집계 테이블 상태 (행 고정, 항상 6개)
  const [offeringTable, setOfferingTable] = useState<OfferingTableState>(() => {
    const saved = localStorage.getItem(`offeringTable_${date}`);
    let rows: OfferingRowData[] = OFFERING_TYPES.map(type => ({
      type,
      names: Array.from({ length: 2 }, () => Array(10).fill('')),
      amount: '',
    }));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 기존 저장된 값이 있으면 type 기준으로 매칭하여 값 유지
        rows = OFFERING_TYPES.map(type => {
          const found = parsed.rows?.find((r: any) => r.type === type);
          return found ? {
            type,
            names: found.names && Array.isArray(found.names) && found.names.length === 2 && found.names[0].length === 10 && found.names[1].length === 10 ? found.names : Array.from({ length: 2 }, () => Array(10).fill('')),
            amount: found.amount ?? '',
          } : {
            type,
            names: Array.from({ length: 2 }, () => Array(10).fill('')),
            amount: '',
          };
        });
      } catch {
        // 파싱 실패 시 기본값
      }
    }
    return { rows };
  });
  useEffect(() => {
    if (date) localStorage.setItem(`offeringTable_${date}`, JSON.stringify(offeringTable));
  }, [offeringTable, date]);

  // 명단/금액 입력 핸들러
  const handleOfferingChange = (rowIdx: number, key: 'names' | 'amount', value: any, i?: number, j?: number) => {
    setOfferingTable(prev => {
      const newRows = prev.rows.map((row, idx) => {
        if (idx !== rowIdx) return row;
        if (key === 'amount') {
          return { ...row, amount: value };
        } else if (key === 'names' && typeof i === 'number' && typeof j === 'number') {
          const newNames = row.names.map(arr => [...arr]);
          newNames[i][j] = value;
          return { ...row, names: newNames };
        }
        return row;
      });
      return { rows: newRows };
    });
  };

  // 총 헌금 합계 계산
  const totalOffering = offeringTable.rows.reduce((sum, row) => {
    const amount = parseInt(row.amount.replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // 날짜별 데이터 자동 복사/초기화 로직
  useEffect(() => {
    if (!date) return;

    // 이미 데이터가 있으면 아무것도 하지 않음(초기화/복사 X)
    const alreadyExists =
      localStorage.getItem(`tables_${date}`) ||
      localStorage.getItem(`visitorTables_${date}`) ||
      localStorage.getItem(`scoreRows_${date}`) ||
      localStorage.getItem(`offeringTable_${date}`);
    if (alreadyExists) return;

    // 이전 주 데이터 복사
    const dateMatch = date.match(/^\d{4}\.\d{2}\.\d{2}$/);
    if (dateMatch) {
      const [year, month, day] = date.split('.');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      d.setDate(d.getDate() - 7);
      const prevDate = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;

      // 전 주 점수 설정 불러오기
      const prevScoreSettings = localStorage.getItem(`scoreSettings_${prevDate}`);
      if (prevScoreSettings) {
        const settings = JSON.parse(prevScoreSettings);
        // 출석 점수 설정 찾기
        const attendSetting = settings.find((setting: any) => setting.label === '출석');
        if (attendSetting) {
          setScoreAttendanceValue(attendSetting.value);
        }
        // 나머지 점수 설정 불러오기
        setScoreSettings(settings.filter((setting: any) => setting.label !== '출석'));
      }

      // --- 출석 집계 복사 ---
      let newTables;
      const prevTables = localStorage.getItem(`tables_${prevDate}`);
      if (prevTables) {
        const tablesData = JSON.parse(prevTables);
        newTables = tablesData.map((table: any) => ({
          ...table,
          rows: table.rows.map((row: any) => ({
            class: row.class,
            teacher: row.teacher,
            students: row.students,
            attends: Array(10).fill(false),
            total: '',
            attend: '',
          }))
        }));
        localStorage.setItem(`tables_${date}`, JSON.stringify(newTables));
        setTables(newTables);
      } else {
        newTables = [
          {
            rows: [
              { class: '1반', teacher: '교사1', students: Array(10).fill(''), attends: Array(10).fill(false), total: '', attend: '' }
            ],
            edit: false
          },
          {
            rows: [
              { class: '2반', teacher: '교사2', students: Array(10).fill(''), attends: Array(10).fill(false), total: '', attend: '' }
            ],
            edit: false
          },
          {
            rows: [
              { class: '3반', teacher: '교사3', students: Array(10).fill(''), attends: Array(10).fill(false), total: '', attend: '' }
            ],
            edit: false
          }
        ];
        localStorage.setItem(`tables_${date}`, JSON.stringify(newTables));
        setTables(newTables);
      }

      // --- 새신자반 복사 ---
      let newVisitorTables;
      const prevVisitorTables = localStorage.getItem(`visitorTables_${prevDate}`);
      if (prevVisitorTables) {
        const visitorData = JSON.parse(prevVisitorTables);
        newVisitorTables = visitorData.map((table: any) => ({
          ...table,
          rows: table.rows.map((row: any) => ({
            students: row.students,
            attends: Array(10).fill(false),
          }))
        }));
        localStorage.setItem(`visitorTables_${date}`, JSON.stringify(newVisitorTables));
        setVisitorTables(newVisitorTables);
      } else {
        newVisitorTables = [{ rows: [], edit: false }];
        localStorage.setItem(`visitorTables_${date}`, JSON.stringify(newVisitorTables));
        setVisitorTables(newVisitorTables);
      }

      // --- 점수 집계 복사 ---
      let newScoreRows;
      const prevScoreRows = localStorage.getItem(`scoreRows_${prevDate}`);
      if (prevScoreRows) {
        const scoreRowsData = JSON.parse(prevScoreRows);
        newScoreRows = scoreRowsData.map((table: any) =>
          table.map((row: any) => ({
            ...row,
            pray: '',
            call: '',
            dim5: '',
            evangel: '',
            bible: '',
            internal: '',
            sum: '',
          }))
        );
        localStorage.setItem(`scoreRows_${date}`, JSON.stringify(newScoreRows));
        setScoreRows(newScoreRows);
      } else {
        newScoreRows = newTables.map((table: any) =>
          table.rows.map((row: any) => ({
            class: row.class,
            teacher: row.teacher,
            total: row.students.filter((name: string) => name.trim() !== '').length,
            attend: row.students.filter((name: string, idx: number) => name.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length.toString(),
            pray: '',
            call: '',
            dim5: '',
            evangel: '',
            bible: '',
            internal: '',
            sum: '',
          }))
        );
        localStorage.setItem(`scoreRows_${date}`, JSON.stringify(newScoreRows));
        setScoreRows(newScoreRows);
      }

      // --- 헌금 집계 초기화 ---
      const newOfferingTable = {
        rows: OFFERING_TYPES.map(type => ({
          type,
          names: Array.from({ length: 2 }, () => Array(10).fill('')),
          amount: '',
        }))
      };
      localStorage.setItem(`offeringTable_${date}`, JSON.stringify(newOfferingTable));
      setOfferingTable(newOfferingTable);
    }
  }, [date]);

  // 반/교사/학생 입력 핸들러 (students는 항상 배열로 저장)
  const handleTableInputChange = (tableIdx: number, rowIdx: number, field: keyof TableRowData, value: any) => {
    setTables(prev => {
      const newTables = prev.map((table, idx) =>
        idx === tableIdx
          ? {
              ...table,
              rows: table.rows.map((row, rIdx) =>
                rIdx === rowIdx
                  ? {
                      ...row,
                      [field]: field === 'students'
                        ? Array.isArray(value)
                          ? value
                          : [value]
                        : value
                  }
                  : row
              ),
            }
          : table
      );
      if (date) {
        localStorage.setItem(`tables_${date}`, JSON.stringify(newTables));
      }
      return newTables;
    });
  };

  // 메인화면 이동 핸들러 (모든 테이블 상태를 localStorage에 저장)
  const handleMainPage = () => {
    if (date) {
      localStorage.setItem(`tables_${date}`, JSON.stringify(tables));
      localStorage.setItem(`visitorTables_${date}`, JSON.stringify(visitorTables));
      localStorage.setItem(`scoreRows_${date}`, JSON.stringify(scoreRows));
      localStorage.setItem(`offeringTable_${date}`, JSON.stringify(offeringTable));
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.location.href = '/main';
  };

  // 전 주 명단 전체 불러오기 핸들러 (출석 집계 전체)
  const handleImportPrevWeekAll = () => {
    if (!date) return;
    const dateMatch = date.match(/^\d{4}\.\d{2}\.\d{2}$/);
    if (!dateMatch) return;
    const [year, month, day] = date.split('.');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    d.setDate(d.getDate() - 7);
    const prevDate = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;

    // 전 주 점수 설정 불러오기
    const prevScoreSettings = localStorage.getItem(`scoreSettings_${prevDate}`);
    if (prevScoreSettings) {
      const settings = JSON.parse(prevScoreSettings);
      // 출석 점수 설정 찾기
      const attendSetting = settings.find((setting: any) => setting.label === '출석');
      if (attendSetting) {
        setScoreAttendanceValue(attendSetting.value);
      }
      // 나머지 점수 설정 불러오기
      setScoreSettings(settings.filter((setting: any) => setting.label !== '출석'));
    }

    // 전 주 출석 집계 불러오기
    const prevTables = localStorage.getItem(`tables_${prevDate}`);
    if (prevTables) {
      const tablesData = JSON.parse(prevTables);
      const newTables = tablesData.map((table: any) => ({
        ...table,
        rows: table.rows.map((row: any) => ({
          class: row.class,
          teacher: row.teacher,
          students: Array.isArray(row.students) ? row.students : Array(10).fill(''),
          attends: Array(10).fill(false),
          total: '',
          attend: '',
        }))
      }));
      setTables(newTables);
      localStorage.setItem(`tables_${date}`, JSON.stringify(newTables));
      alert('명단을 불러왔습니다.');
      window.location.reload();
    } else {
      alert('전 주 데이터가 없습니다.');
    }
  };

  // 점수 설정 입력 핸들러
  const handleScoreSettingChange = (idx: number, key: 'label' | 'value', value: string) => {
    setScoreSettings(prev => {
      const newSettings = [...prev];
      newSettings[idx] = {
        ...newSettings[idx],
        [key]: value
      };
      return newSettings;
    });
  };

  // 점수 설정 항목 추가/삭제
  const handleAddScoreSetting = () => {
    setScoreSettings(prev => [...prev, { label: '', value: '' }]);
  };
  const handleDeleteScoreSetting = (idx: number) => {
    setScoreSettings(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#ffffff' }}>
            {date} 집계
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleMainPage}
            sx={{ ml: 2, backgroundColor: '#333333', color: '#ffffff', '&:hover': { backgroundColor: '#444444' } }}
          >
            메인화면
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 0.5, minWidth: 'auto', minHeight: 'calc(100vh - 64px)', px: 1, py: 2, overflowX: 'hidden', backgroundColor: '#f5f5f5' }} maxWidth={false}>
        <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0', overflowX: 'hidden' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="집계 탭" sx={{ '& .MuiTab-root': { color: '#666666' }, '& .Mui-selected': { color: '#000000' } }}>
            <Tab label="출석 집계" />
            <Tab label="점수 집계" />
            <Tab label="헌금 집계" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 2, overflowX: 'hidden' }}>
            {/* 오른쪽: 학생/교사 테이블 */}
            <Box sx={{ minWidth: 220, maxWidth: 260, width: 220, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 학생 테이블 */}
              <TableContainer component={Paper} sx={{ boxShadow: 1, minWidth: 220, maxWidth: 260, width: 220, overflowX: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '2px solid #888', py: 1, minHeight: 20 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2, display: 'inline-block' }}>출석 통계</Typography>
                  <Button size="small" variant="outlined" sx={{ ml: 2, mr: 1, fontSize: '0.8rem', px: 1, py: 0.5 }} onClick={() => setStatEdit(e => !e)}>
                            {statEdit ? '완료' : '수정'}
                          </Button>
                        </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>구분</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>재적</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>출석</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statRowsState.map((row, idx) => (
                      <React.Fragment key={row.label}>
                        <TableRow>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>{row.label}</TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {statEdit ? (
                              <TextField
                                {...noBoxTextFieldProps}
                                value={row.total}
                                onChange={e => {
                                  const newRows = [...statRowsState];
                                  newRows[idx].total = Number(e.target.value);
                                  setStatRowsState(newRows);
                                }}
                              />
                            ) : (
                              row.total
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {statEdit ? (
                              <TextField
                                {...noBoxTextFieldProps}
                                value={row.attend}
                                onChange={e => {
                                  const newRows = [...statRowsState];
                                  newRows[idx].attend = Number(e.target.value);
                                  setStatRowsState(newRows);
                                }}
                              />
                            ) : (
                              row.attend
                            )}
                          </TableCell>
                        </TableRow>
                        {row.label === '새친구' && (
                          <TableRow>
                            <TableCell colSpan={3} sx={{ borderTop: '2px solid #888', height: 0, p: 0, lineHeight: 0, minHeight: 0, borderBottom: 0 }} />
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {/* 왼쪽: 반 테이블 영역 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tables.map((table, tableIdx) => (
                <TableContainer component={Paper} key={tableIdx} sx={{ overflowX: 'visible', overflowY: 'visible' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '2px solid #888' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>{tableNames[tableIdx]}</Typography>
                    <Button size="small" variant="outlined" sx={{ ml: 2 }} onClick={() => handleEditToggle(tableIdx)}>
                      {table.edit ? '완료' : '수정'}
                    </Button>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>반</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>교사</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }} colSpan={10}>학생</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>재적</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>출석</TableCell>
                        {table.edit && <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>삭제</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {table.rows.map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {table.edit ? (
                              <TextField
                                {...noBoxTextFieldProps}
                                value={row.class}
                                onChange={e => handleTableInputChange(tableIdx, rowIdx, 'class', e.target.value)}
                              />
                            ) : (
                              row.class
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {table.edit ? (
                              <TextField
                                {...noBoxTextFieldProps}
                                value={row.teacher}
                                onChange={e => handleTableInputChange(tableIdx, rowIdx, 'teacher', e.target.value)}
                              />
                            ) : (
                              row.teacher
                            )}
                          </TableCell>
                          {row.students.map((student: string, i: number) => {
                            const attends = row.attends ?? Array(10).fill(false);
                            return (
                              <TableCell
                                align="center"
                                key={i}
                                sx={{ 
                                  borderRight: '1px solid #ccc', 
                                  minWidth: 60, 
                                  height: 24,  // 높이를 32에서 24로 줄임
                                  p: 0.25,     // 패딩을 0.5에서 0.25로 줄임
                                  ...(row.attends && row.attends[i] ? {
                                    color: '#222',
                                    backgroundColor: tableColors[tableIdx].bg,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  } : { cursor: 'pointer' }) 
                                }}
                                onClick={() => {
                                  if (table.edit) return; // 수정 모드에서는 색상 토글 금지
                                  const newTables = [...tables];
                                  if (!newTables[tableIdx].rows[rowIdx].attends) {
                                    newTables[tableIdx].rows[rowIdx].attends = Array(10).fill(false);
                                  }
                                  newTables[tableIdx].rows[rowIdx].attends[i] = !newTables[tableIdx].rows[rowIdx].attends[i];
                                  setTables(newTables);
                                }}
                              >
                                {table.edit ? (
                                  <TextField
                                    {...noBoxTextFieldProps}
                                    value={student}
                                    onChange={e => {
                                      const newStudents = [...tables[tableIdx].rows[rowIdx].students];
                                      newStudents[i] = e.target.value;
                                      handleTableInputChange(tableIdx, rowIdx, 'students', newStudents);
                                    }}
                                  />
                                ) : (
                                  <span style={row.attends && row.attends[i] ? { color: '#222', background: tableColors[tableIdx].bg, borderRadius: 4, padding: '2px 4px' } : { color: '#222' }}>{student}</span>
                                )}
                              </TableCell>
                            );
                          })}
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {row.students.filter((student: string) => student.trim() !== '').length}
                          </TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {row.students.filter((student: string, idx: number) => student.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length}
                          </TableCell>
                          {table.edit && (
                            <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                              <Button size="small" color="error" onClick={() => handleDeleteRow(tableIdx, rowIdx)}>
                                삭제
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {table.edit && (
                    <Box sx={{ p: 1, textAlign: 'right' }}>
                      <Button size="small" variant="contained" onClick={() => handleAddRow(tableIdx)}>
                        행 추가
                      </Button>
                    </Box>
                  )}
                </TableContainer>
              ))}
              {/* 새신자반 테이블 */}
              {visitorTables.map((table, tableIdx) => (
                <TableContainer component={Paper} key={tableIdx + 'visitor'}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '2px solid #888' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>새신자반</Typography>
                    <Button size="small" variant="outlined" sx={{ ml: 4 }} onClick={() => handleVisitorEditToggle(tableIdx)}>
                      {table.edit ? '완료' : '수정'}
                    </Button>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }} colSpan={10}>학생</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>재적</TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>출석</TableCell>
                        {table.edit && <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>삭제</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {table.rows.map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          {row.students.map((student, i) => (
                            <TableCell
                              align="center"
                              key={i}
                              sx={{ borderRight: '1px solid #ccc', minWidth: 60, height: 24, p: 0.25, ...(row.attends && row.attends[i] ? {
                                color: '#222',
                                backgroundColor: '#ffadb0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              } : { cursor: 'pointer' }) }}
                              onClick={() => {
                                if (table.edit) return;
                                const newTables = [...visitorTables];
                                if (!newTables[tableIdx].rows[rowIdx].attends) {
                                  newTables[tableIdx].rows[rowIdx].attends = Array(10).fill(false);
                                }
                                newTables[tableIdx].rows[rowIdx].attends[i] = !newTables[tableIdx].rows[rowIdx].attends[i];
                                setVisitorTables(newTables);
                              }}
                            >
                              {table.edit ? (
                                <TextField
                                  {...noBoxTextFieldProps}
                                  value={student}
                                  onChange={e => {
                                    const newStudents = [...visitorTables[tableIdx].rows[rowIdx].students];
                                    newStudents[i] = e.target.value;
                                    setVisitorTables(prev => {
                                      const newTables = [...prev];
                                      newTables[tableIdx].rows[rowIdx].students = newStudents;
                                      return newTables;
                                    });
                                  }}
                                />
                              ) : (
                                <span style={row.attends && row.attends[i] ? { color: '#222', background: '#ffadb0', borderRadius: 4, padding: '2px 4px' } : { color: '#222' }}>{student}</span>
                              )}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {row.students.filter((student: string) => student.trim() !== '').length}
                          </TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            {row.students.filter((student: string, idx: number) => student.trim() !== '' && (row.attends ?? Array(10).fill(false))[idx]).length}
                          </TableCell>
                          {table.edit && (
                            <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                              <Button size="small" color="error" onClick={() => handleVisitorDeleteRow(tableIdx, rowIdx)}>
                                삭제
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {table.edit && (
                    <Box sx={{ p: 1, textAlign: 'right' }}>
                      <Button size="small" variant="contained" onClick={() => handleVisitorAddRow(tableIdx)}>
                        행 추가
                      </Button>
                    </Box>
                  )}
                </TableContainer>
              ))}
            </Box>
          </Box>
          <Fab
            color="primary"
            aria-label="전 주 명단 불러오기"
            onClick={handleImportPrevWeekAll}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 2000,
            }}
          >
            <CompareArrowsIcon />
          </Fab>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
            {/* 왼쪽: 점수 집계 테이블 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tables.map((table, tableIdx) => (
                <TableContainer component={Paper} key={tableIdx} sx={{ overflowX: 'visible', overflowY: 'visible' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '2px solid #888' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>{tableNames[tableIdx]}</Typography>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {scoreFixedHeaders.map((header) => (
                          <TableCell align="center" key={header} sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS[header] ?? 30, minWidth: SCORE_COL_WIDTHS[header] ?? 30, maxWidth: SCORE_COL_WIDTHS[header] ?? 30 }}>{header}</TableCell>
                        ))}
                        {/* 출석은 항상 고정 */}
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS['출석'] ?? 30, minWidth: SCORE_COL_WIDTHS['출석'] ?? 30, maxWidth: SCORE_COL_WIDTHS['출석'] ?? 30 }}>출석</TableCell>
                        {scoreSettings.map((setting, idx) => (
                          <TableCell align="center" key={setting.label} sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS[setting.label] ?? 30, minWidth: SCORE_COL_WIDTHS[setting.label] ?? 30, maxWidth: SCORE_COL_WIDTHS[setting.label] ?? 30, ...(setting.label === '출석' && { textAlign: 'center' }) }}>
                            {setting.label}
                          </TableCell>
                        ))}
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>총점</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {table.rows.map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS['반'] ?? 30, minWidth: SCORE_COL_WIDTHS['반'] ?? 30, maxWidth: SCORE_COL_WIDTHS['반'] ?? 30 }}>{row.class}</TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS['교사'] ?? 30, minWidth: SCORE_COL_WIDTHS['교사'] ?? 30, maxWidth: SCORE_COL_WIDTHS['교사'] ?? 30 }}>{row.teacher}</TableCell>
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS['재적'] ?? 30, minWidth: SCORE_COL_WIDTHS['재적'] ?? 30, maxWidth: SCORE_COL_WIDTHS['재적'] ?? 30 }}>{row.students.filter((name: string) => name.trim() !== '').length}</TableCell>
                          {/* 출석 점수 */}
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS['출석'] ?? 30, minWidth: SCORE_COL_WIDTHS['출석'] ?? 30, maxWidth: SCORE_COL_WIDTHS['출석'] ?? 30 }}>{scoreRows[tableIdx]?.[rowIdx]?.attend || ''}</TableCell>
                          {scoreSettings.map((setting, idx) => (
                            <TableCell key={setting.label} sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS[setting.label] ?? 30, minWidth: SCORE_COL_WIDTHS[setting.label] ?? 30, maxWidth: SCORE_COL_WIDTHS[setting.label] ?? 30, ...(setting.label === '출석' && { textAlign: 'center' }) }}>
                              {['기도회','전화심방','5차원','전도','성경읽기','내면화'].includes(setting.label) ? (
                                <TextField
                                  type="text"
                                  {...noBoxTextFieldProps}
                                  value={scoreRows[tableIdx]?.[rowIdx]?.[setting.label.toLowerCase() as keyof ScoreRowData] || ''}
                                  onChange={(e) => handleScoreChange(tableIdx, rowIdx, setting.label.toLowerCase() as keyof ScoreRowData, e.target.value)}
                                />
                              ) : (
                                scoreRows[tableIdx]?.[rowIdx]?.[setting.label.toLowerCase() as keyof ScoreRowData] || ''
                              )}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc', width: SCORE_COL_WIDTHS['총점'] ?? 30, minWidth: SCORE_COL_WIDTHS['총점'] ?? 30, maxWidth: SCORE_COL_WIDTHS['총점'] ?? 30 }}>
                            {scoreRows[tableIdx]?.[rowIdx]?.sum || ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ))}
            </Box>
            {/* 오른쪽: 점수 설정 테이블 */}
            <Box sx={{ minWidth: 260, maxWidth: 340, width: 300 }}>
              <TableContainer component={Paper} sx={{ minWidth: 260, maxWidth: 340, width: 300 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderBottom: '2px solid #888' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>점수 설정</Typography>
                  <Button size="small" variant="outlined" sx={{ ml: 2, fontSize: '0.8rem', px: 1, py: 0.5 }} onClick={() => setScoreSettingEdit(e => !e)}>
                    {scoreSettingEdit ? '완료' : '수정'}
                  </Button>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>구분</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>점수</TableCell>
                      {scoreSettingEdit && <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>삭제</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* 출석은 항상 고정 */}
                    <TableRow>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>출석</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                        {scoreSettingEdit ? (
                          <TextField
                            {...noBoxTextFieldProps}
                            value={scoreAttendanceValue}
                            onChange={e => handleScoreAttendanceChange(e.target.value)}
                            inputProps={{ style: { textAlign: 'center' } }}
                          />
                        ) : (
                          scoreAttendanceValue
                        )}
                      </TableCell>
                      {scoreSettingEdit && <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}></TableCell>}
                    </TableRow>
                    {/* 나머지 항목은 추가/삭제/수정 가능 */}
                    {scoreSettings.map((row, idx) => (
                      <TableRow key={row.label + idx}>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                          {scoreSettingEdit ? (
                            <TextField
                              {...noBoxTextFieldProps}
                              value={row.label}
                              onChange={(e) => handleScoreSettingChange(idx, 'label', e.target.value)}
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                          ) : (
                            row.label
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                          {scoreSettingEdit ? (
                            <TextField
                              {...noBoxTextFieldProps}
                              value={row.value}
                              onChange={(e) => handleScoreSettingChange(idx, 'value', e.target.value)}
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                          ) : (
                            row.value
                          )}
                        </TableCell>
                        {scoreSettingEdit && (
                          <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                            <Button size="small" color="error" onClick={() => handleDeleteScoreSetting(idx)}>
                              삭제
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {scoreSettingEdit && (
                  <Box sx={{ p: 1, textAlign: 'right' }}>
                    <Button size="small" variant="contained" onClick={handleAddScoreSetting}>
                      항목 추가
                    </Button>
                  </Box>
                )}
              </TableContainer>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'flex-start' }}>
            {/* 헌금 집계 테이블 */}
            <TableContainer component={Paper} sx={{ maxWidth: 1200, minWidth: 900, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '2px solid #888' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>헌금 집계</Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>구분</TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }} colSpan={10}>명단</TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>금액</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offeringTable.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>{row.type}</TableCell>
                      <TableCell align="center" colSpan={10} sx={{ borderRight: '1px solid #ccc', p: 0 }}>
                        <Table size="small" sx={{ border: 0, width: '100%' }}>
                          <TableBody>
                            {row.names.map((rowArr, i) => (
                              <TableRow key={i}>
                                {rowArr.map((name, j) => (
                                  <TableCell key={j} align="center" sx={{ p: 0.5, borderRight: '1px solid #ccc' }}>
                                    <TextField
                                      type="text"
                                      {...noBoxTextFieldProps}
                                      value={name}
                                      onChange={e => handleOfferingChange(rowIdx, 'names', e.target.value, i, j)}
                                      inputProps={{ style: { textAlign: 'center', fontSize: 14 } }}
                                      sx={{ width: 60 }}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #ccc' }}>
                        <TextField
                          type="text"
                          {...noBoxTextFieldProps}
                          value={row.amount}
                          onChange={e => handleOfferingChange(rowIdx, 'amount', e.target.value)}
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* 총 헌금 테이블 */}
            <TableContainer component={Paper} sx={{ minWidth: 180, maxWidth: 220 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderBottom: '2px solid #888' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 2 }}>총 헌금</Typography>
              </Box>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell align="center" sx={{ fontSize: '1.2rem', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>{totalOffering.toLocaleString()} 원</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Container>
    </div>
  );
}

export default DatePage; 