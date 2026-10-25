import { useState } from 'react';

// 1. 보기(Option) DTO
export interface Option {
  id: number;
  text: string;
}

// 2. 질문(Question) DTO
export interface Question {
  id: number;
  type: 'OBJECTIVE' | 'SUBJECTIVE'; // 객관식인지 주관식인지
  isMultiple: boolean;              // 다중 선택 허용 여부
  text: string;                     // 질문 내용
  options: Option[];                // 객관식일 경우 보기들의 배열 (주관식일 땐 빈 배열)
}



export default function SurveyCreate() {
  // 3. 설문조사 전체를 관리하는 '단 하나의 거대한 배열 상태(State)'
  const [questions, setQuestions] = useState<Question[]>([]);

  // (여기에 질문 추가, 보기 추가 등의 함수가 들어갈 예정입니다!)
  // ★ 질문 추가 함수 (불변성 유지!)
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(), // 고유한 ID값 생성 (현재 시간 밀리초)
      type: 'OBJECTIVE', // 기본값은 객관식
      isMultiple: false, // 기본값은 단일 선택
      text: '',
      options: [] // 처음엔 보기가 없는 빈 배열
    };

    // 기존 질문 배열을 쫙 펼치고(...), 맨 끝에 새 질문을 쏙 넣어서 새 배열로 교체!
    setQuestions([...questions, newQuestion]);
  };

  return (
    <div>
      <h2>📝 설문조사 생성 (관리자용)</h2>
        {/* 질문 추가 버튼 */}
      <button 
        onClick={addQuestion} 
        style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', marginBottom: '20px' }}
      >
        + 질문 추가
      </button>

      {/* 질문 리스트 렌더링 영역 */}
      {questions.map((q, qIndex) => (
        <div key={q.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
          <h4>질문 {qIndex + 1}</h4>
          {/* 일단은 질문 ID와 타입만 찍어봅시다! */}
          <p>ID: {q.id} | 타입: {q.type}</p>
        </div>
      ))}
    </div>
  );
}