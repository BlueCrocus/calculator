// script.js

// 계산기 상태 변수
let currentInput = '0'; // 현재 화면에 표시되는 값
let firstOperand = null; // 첫 번째 피연산자
let operator = null; // 선택된 연산자 ('add', 'subtract', etc.)
let waitingForSecondOperand = false; // 연산자 입력 후 두 번째 피연산자를 기다리는지 여부
let calculationHistory = ''; // 계산 과정을 저장하는 문자열 (예: '87 +')

// DOM 요소 참조
const display = document.getElementById('display');
const historyDisplay = document.getElementById('history-display');
const buttons = document.querySelector('.buttons');

// 화면 업데이트 함수
function updateDisplay() {
  // 너무 긴 숫자는 지수 표기법으로 표시 (선택 사항)
  if (currentInput.length > 10) {
    display.textContent = parseFloat(currentInput).toPrecision(10);
  } else {
    display.textContent = currentInput;
  }
}

function updateHistoryDisplay() {
  historyDisplay.textContent = calculationHistory;
}

// 연산자 이름을 기호로 변환
function getOperatorSymbol(op) {
  switch (op) {
    case 'add': return '+';
    case 'subtract': return '-';
    case 'multiply': return 'x';
    case 'divide': return '÷';
    default: return '';
  }
}

// 숫자 버튼 처리
function inputDigit(digit) {
  if (waitingForSecondOperand === true) {
    currentInput = digit;
    waitingForSecondOperand = false;
  } else {
    // '0'만 있고 소수점이 없을 때 새 숫자로 교체, 아니면 추가
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
  updateDisplay();
}

// 소수점 처리
function inputDecimal(dot) {
  if (waitingForSecondOperand === true) {
    currentInput = '0.';
    waitingForSecondOperand = false;
    updateDisplay();
    return;
  }
  // 이미 소수점이 없으면 추가
  if (!currentInput.includes(dot)) {
    currentInput += dot;
  }
  updateDisplay();
}

// AC (초기화) 처리
function resetCalculator() {
  currentInput = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  calculationHistory = '';
  updateHistoryDisplay();
  updateDisplay();
}

// 실제 사칙연산 함수
function calculate(first, second, op) {
  switch (op) {
    case 'add':
      return first + second;
    case 'subtract':
      return first - second;
    case 'multiply':
      return first * second;
    case 'divide':
      if (second === 0) {
        return 'Error'; // 0으로 나누기 오류 처리
      }
      return first / second;
    default:
      return second;
  }
}

// 연산 로직
function performCalculation(nextOperator) {
  const inputValue = parseFloat(currentInput);

  if (currentInput === 'Error') {
    resetCalculator();
    return;
  }

  if (operator && waitingForSecondOperand) {
    // 연산자를 연속으로 누르면 새 연산자로만 변경하고 계산은 하지 않음
    operator = nextOperator;
    calculationHistory = String(firstOperand) + ' ' + getOperatorSymbol(operator);
    updateHistoryDisplay();
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    // 이전 연산 수행
    const result = calculate(firstOperand, inputValue, operator);

    currentInput = String(result);
    firstOperand = result;
  }

  // 다음 상태 설정
  waitingForSecondOperand = true;

  if (nextOperator === 'equals') {
    operator = null;
    calculationHistory = ''; // '='이면 히스토리 비움
  } else {
    operator = nextOperator;
    // 히스토리 업데이트: (현재까지의 결과) + (새 연산자 기호)
    const operatorSymbol = getOperatorSymbol(operator);
    calculationHistory = String(firstOperand) + ' ' + operatorSymbol;
  }

  updateHistoryDisplay();
  updateDisplay();
}

// 이벤트 리스너 설정
buttons.addEventListener('click', (event) => {
  const { target } = event;
  const { type, num, op } = target.dataset;

  if (!target.matches('button')) {
    return;
  }

  if (type === 'clear') {
    resetCalculator();
    return;
  }

  if (op) { // 연산자 버튼
    // +/- 와 % 는 바로 적용 (단항 연산)
    if (op === 'neg') {
      currentInput = String(parseFloat(currentInput) * -1);
      updateDisplay();
      return;
    }
    if (op === 'percent') {
      currentInput = String(parseFloat(currentInput) / 100);
      updateDisplay();
      return;
    }
    performCalculation(op);
    return;
  }

  if (num) { // 숫자 또는 소수점 버튼
    if (num === '.') {
      inputDecimal(num);
    } else {
      inputDigit(num);
    }
    return;
  }
});

// 초기 화면 표시
updateDisplay();
updateHistoryDisplay();