// DefaultPage: 날짜가 지정되지 않았을 때 기본으로 보여주는 페이지
// DatePage를 '기본' 날짜로 렌더링합니다.
import React from 'react';
import DatePage from './DatePage';

export default function DefaultPage() {
  // DatePage에 date prop으로 '기본'을 전달
  return <DatePage date={'기본'} />;
} 