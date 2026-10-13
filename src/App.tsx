import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { evaluate, formatNumber, INPUT_LIMIT } from './lib/calculator';
import type { AngleMode } from './lib/calculator';
import { categories, convertCurrency, convertUnit, currencies, parseValue } from './lib/conversions';
import { getUnitReferences } from './lib/unitReferences';
import { getCurrencyReferences } from './lib/currencyReferences';
import { formatCurrencyAmount } from './lib/currencyDisplay';
import { editCalculatorExpression, toggleCurrentNumber } from './lib/calculatorInput';
import { formatCalculatorExpression, formatCalculatorResult } from './lib/calculatorDisplay';

type Tool = 'calculator' | 'units' | 'currency';
type HistoryItem = { expression: string; result: number; angle: AngleMode };
type IconName = 'calculator' | 'units' | 'currency' | 'lock' | 'arrow' | 'backspace' | 'shield' | 'sun' | 'history' | 'check' | 'swap';
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    calculator: <><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 11h1m6 0h1M8 15h1m6 0h1M8 18h1m6 0h1"/></>,
    units: <><path d="m5 9 4-4 10 10-4 4L5 9Z"/><path d="m9 7-2 2m5 1-2 2m5 1-2 2m5 1-2 2"/></>,
    currency: <><circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/></>,
    lock: <><rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2"/></>,
    arrow: <path d="m8 5 7 7-7 7"/>,
    backspace: <><path d="M9 5h11v14H9l-7-7 7-7Z"/><path d="m11 9 6 6m0-6-6 6"/></>,
    shield: <><path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    history: <><path d="M4 7a9 9 0 1 1-1 8M4 3v5h5m3 0v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    swap: <><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const headings = {
  calculator: ['Calculator', 'Big ideas. Small calculations. Everything adds up.'],
  units: ['Unit converter', 'Different units. One simple answer.'],
  currency: ['Currency converter', 'A quick reference for money around the world.'],
};

export default function App() {
  const [tool, setTool] = useState<Tool>('calculator');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); setTool('calculator'); }} aria-label="Calcify home"><img className="brand-mark" src="./favicon.svg" alt="" width="40" height="40"/><span>Calcify</span></a>
      <div className="sidebar-caption">EVERYDAY TOOLS</div>
      <nav aria-label="Main navigation">
        {([['calculator', 'Calculator'], ['units', 'Unit converter'], ['currency', 'Currency converter']] as const).map(([id, title]) => <button key={id} className={`nav-item ${tool === id ? 'active' : ''}`} onClick={() => setTool(id)} aria-current={tool === id ? 'page' : undefined}><Icon name={id === 'calculator' ? 'calculator' : id === 'units' ? 'units' : 'currency'}/><span>{title}</span>{tool === id && <span className="active-dot"/>}</button>)}
        <button className="nav-item coming-soon" disabled aria-label="Loan / EMI Calculator — Coming soon"><Icon name="lock"/><span>Loan / EMI<small>Coming soon</small></span><span className="soon-pill">SOON</span></button>
      </nav>
      <div className="sidebar-bottom"><strong>Just you and your numbers.</strong><p>No accounts. No distractions.<br/>Everything stays in your browser.</p><div className="creator-credit">Designed &amp; developed by <span className="creator-name">G.Sarwar</span></div></div>
      <div className="version">Made for the everyday.</div>
    </aside>
    <div className="workspace">
      <header className="topbar"><span>Your everyday number companion</span><span className="browser-badge"><span/>Runs in your browser</span></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">A LITTLE CLARITY, EVERY DAY</div><h1>{headings[tool][0]}</h1><p>{headings[tool][1]}</p></div><div className="heading-symbol"><Icon name={tool === 'calculator' ? 'calculator' : tool === 'units' ? 'units' : 'currency'} size={28}/></div></div>
        <div className="content-grid">
          <div className="primary-tool" hidden={tool !== 'calculator'}><Calculator onHistory={item => setHistory(items => [item, ...items].slice(0, 6))}/></div>
          <div className="primary-tool" hidden={tool !== 'units'}><Converter currency={false}/></div>
          <div className="primary-tool" hidden={tool !== 'currency'}><Converter currency/></div>
          <aside className="support-column">
            {tool === 'calculator' ? <><section className="history-card"><div className="section-title"><span><Icon name="history" size={18}/>Recent calculations</span>{history.length > 0 && <button className="text-button" onClick={() => setHistory([])}>Clear</button>}</div>{history.length === 0 ? <div className="empty-history"><div className="empty-icon"><Icon name="history" size={27}/></div><strong>A fresh start</strong><p>Your calculations will appear here.<br/>A little less remembering for you.</p></div> : <ul className="history-list">{history.map((item, index) => <li key={`${index}-${item.expression}`}><div>{formatCalculatorExpression(item.expression)}{/sin|cos|tan/.test(item.expression) && <small> · {item.angle}</small>}</div><strong>= {formatCalculatorResult(item.result)}</strong></li>)}</ul>}<div className="history-footer"><span/>Only kept for this session</div></section><section className="tip-card"><span className="tip-icon"><Icon name="sun" size={20}/></span><h3>A shortcut to your answer</h3><p>Your keyboard works here, too.</p><div className="shortcut-row"><span>Calculate</span><kbd>Enter</kbd></div><div className="shortcut-row"><span>Clear all</span><kbd>Esc</kbd></div><div className="shortcut-row"><span>Delete a digit</span><kbd>⌫</kbd></div></section></> : <><section className="tip-card converter-tip"><span className="tip-icon"><Icon name={tool === 'currency' ? 'currency' : 'units'}/></span><h3>{tool === 'currency' ? 'A reference, not a quote' : 'From this to that'}</h3><p>{tool === 'currency' ? 'These demo rates are fixed examples. They do not update and should not be used for financial decisions.' : 'Choose a category, enter your value, then pick your units. Your answer updates as you go.'}</p><div className="tip-divider"/><p>{tool === 'currency' ? 'All currencies use the same USD reference base for consistent conversions.' : 'Use the swap button to reverse your units and keep the value you entered.'}</p></section>{tool === 'units' && <section className="mini-card"><Icon name="check" size={18}/><span>13 categories, all in one place.</span></section>}</>}
          </aside>
        </div>
        <footer className="main-footer"><span><Icon name="shield" size={15}/>Simple tools. A little peace of mind.</span><span>Calculate. Convert. Carry on.</span></footer>
      </main>
    </div>
  </div>;
}

function Calculator({ onHistory }: { onHistory: (item: HistoryItem) => void }) {
  const [scientific, setScientific] = useState(false);
  const [angle, setAngle] = useState<AngleMode>('DEG');
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLInputElement>(null);
  const editingRef = useRef(false);
  const selectionRef = useRef({ start: 0, end: 0 });
  const pendingCaret = useRef<number | null>(null);
  const update = (value: string) => {
    if (value.length > INPUT_LIMIT) { setError(`Keep calculations under ${INPUT_LIMIT} characters.`); return; }
    setExpression(value); setError(''); setAnswered(false); setAnswer(null);
  };
  const press = (value: string) => {
    if (value === 'AC') { editingRef.current = false; pendingCaret.current = 0; update(''); return; }
    if (value === '=') {
      if (!expression) return;
      try {
        const result = evaluate(expression, angle);
        onHistory({ expression, result, angle });
        setAnswer(result); setAnswered(true); setError(''); editingRef.current = false;
      } catch (failure) {
        setAnswer(null); setAnswered(false); setError((failure as Error).message);
      }
      return;
    }
    const editing = editingRef.current;
    const continuation = /^[+−×÷^%]$/.test(value) || value === '^2' || value === '±' || value === 'backspace';
    const current = answered && !editing ? (continuation && answer !== null ? answer.toString() : '') : expression;
    let { start, end } = editing ? selectionRef.current : { start: current.length, end: current.length };
    start = Math.min(start, current.length); end = Math.min(end, current.length);
    if (value === 'backspace' || value === 'delete') {
      if (start === end) {
        if (value === 'backspace') start = Math.max(0, start - 1);
        else end = Math.min(current.length, end + 1);
      }
      const edit = editCalculatorExpression(current, start, end, '');
      pendingCaret.current = edit.caret; update(edit.expression); return;
    }
    if (value === '±') {
      const number = [...current.matchAll(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?%*/g)]
        .find(match => match.index < end && match.index + match[0].length >= end);
      const boundary = number ? number.index + number[0].length : end;
      const toggled = toggleCurrentNumber(current.slice(0, boundary));
      pendingCaret.current = Math.max(0, end + toggled.length - boundary);
      update(toggled + current.slice(boundary));
      return;
    }
    const edit = editCalculatorExpression(current, start, end, value);
    pendingCaret.current = edit.caret;
    update(edit.expression);
  };
  const pressRef = useRef(press);
  pressRef.current = press;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('[hidden]') || document.querySelector('.primary-tool:not([hidden])')?.querySelector('.calculator-card') === null) return;
      if (target.matches('input, select, textarea') && target.id !== 'calculation-display') return;
      if (target.id === 'calculation-display' && ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        editingRef.current = true; return;
      }
      let value: string | undefined;
      if (/^[0-9.()%^]$/.test(event.key)) value = event.key;
      else value = ({ '+': '+', '-': '−', '*': '×', '/': '÷', Enter: '=', '=': '=', Escape: 'AC', Backspace: 'backspace', Delete: target.id === 'calculation-display' ? 'delete' : 'AC' } as Record<string, string>)[event.key];
      if (value) {
        if (event.key === 'Enter' && target.matches('button') && !target.closest('.keypad, .scientific-keypad')) return;
        event.preventDefault(); pressRef.current(value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && inputRef.current) {
      const caret = pendingCaret.current;
      inputRef.current.setSelectionRange(caret, caret);
      selectionRef.current = { start: caret, end: caret };
      pendingCaret.current = null;
    }
  });
  useEffect(() => {
    const input = answered ? resultRef.current : inputRef.current;
    if (!input) return;
    const fitDisplay = () => {
      input.style.fontSize = '';
      // Fit results and individual numbers; multi-part expressions can scroll.
      if (answered || /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/.test(expression)) {
        const context = document.createElement('canvas').getContext('2d');
        const style = getComputedStyle(input);
        if (context && input.clientWidth > 0) {
          context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          const width = context.measureText(input.value).width;
          const fontSize = parseFloat(style.fontSize);
          if (width > input.clientWidth - 4) input.style.fontSize = `${fontSize * (input.clientWidth - 4) / width}px`;
        }
      }
      if (answered) input.scrollLeft = 0;
    };
    fitDisplay();
    const observer = new ResizeObserver(fitDisplay);
    observer.observe(input);
    return () => observer.disconnect();
  }, [expression, answered, answer]);
  const displayedValue = answered && answer !== null ? formatCalculatorResult(answer) : expression;
  const handleExpressionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const candidate = event.target.value;
    let start = 0;
    while (start < expression.length && start < candidate.length && expression[start] === candidate[start]) start++;
    let oldEnd = expression.length;
    let newEnd = candidate.length;
    while (oldEnd > start && newEnd > start && expression[oldEnd - 1] === candidate[newEnd - 1]) { oldEnd--; newEnd--; }
    const edit = editCalculatorExpression(expression, start, oldEnd, candidate.slice(start, newEnd));
    editingRef.current = true;
    pendingCaret.current = edit.caret;
    update(edit.expression);
  };
  const basicKeys = ['AC', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', 'backspace', '0', '.', '='];
  const scienceKeys = [['sin(', 'sin'], ['cos(', 'cos'], ['tan(', 'tan'], ['sqrt(', '√'], ['^2', 'x²'], ['^', 'xʸ'], ['log(', 'log'], ['ln(', 'ln'], ['π', 'π'], ['(', '('], [')', ')']];
  return <section className="calculator-card" aria-label="Calculator">
    <div className="calculator-toolbar"><div className="segmented" aria-label="Calculator mode"><button className={!scientific ? 'selected' : ''} aria-pressed={!scientific} onClick={() => setScientific(false)}>Basic</button><button className={scientific ? 'selected' : ''} aria-pressed={scientific} onClick={() => setScientific(true)}>Scientific</button></div>{scientific ? <div className="angle-control" aria-label="Angle mode">{(['DEG', 'RAD'] as const).map(mode => <button key={mode} aria-pressed={angle === mode} className={angle === mode ? 'selected' : ''} onClick={() => { setAngle(mode); setAnswered(false); setAnswer(null); setError('' ); }}>{mode}</button>)}</div> : <span className="mode-label">THE EVERYDAY ESSENTIALS</span>}</div>
    <div className={`calculator-display ${error ? 'has-error' : ''}`}><div className="display-meta"><span>{answered ? 'YOUR ANSWER' : 'LET’S WORK IT OUT'}</span><span>{scientific ? `${angle} MODE` : 'BASIC MODE'}</span></div><label className="sr-only" htmlFor="calculation-display">Calculation expression</label><input ref={inputRef} id="calculation-display" value={expression} placeholder="0" inputMode="decimal" autoComplete="off" spellCheck={false} onFocus={() => { editingRef.current = true; }} onPointerDown={() => { editingRef.current = true; }} onSelect={event => { selectionRef.current = { start: event.currentTarget.selectionStart ?? 0, end: event.currentTarget.selectionEnd ?? 0 }; }} onChange={handleExpressionChange} aria-describedby={error ? 'calculation-error' : undefined} className={answered ? 'expression-editor' : expression.length > 16 ? 'long-expression' : ''}/>{answered && <input ref={resultRef} readOnly aria-label="Calculation result" value={displayedValue} tabIndex={-1} className={displayedValue.length > 16 ? 'long-expression' : ''}/>}<div className="display-status" aria-live="polite">{error ? <span id="calculation-error" role="alert">{error}</span> : <span>{answered ? 'Click the expression to edit, or continue with an operator.' : expression ? 'Press = or Enter for your answer' : 'A clear mind starts with a clean slate.'}</span>}</div><span className="sr-only" role="status">{answered && answer !== null ? `Answer: ${formatCalculatorResult(answer)}` : ''}</span></div>
    {scientific && <div className="scientific-keypad">{scienceKeys.map(([value, label]) => <button key={value} onMouseDown={event => event.preventDefault()} onClick={() => press(value)} aria-label={({ 'sqrt(': 'Square root', '^2': 'Square', '^': 'Power', 'π': 'Pi', '(': 'Open parenthesis', ')': 'Close parenthesis' } as Record<string, string>)[value] ?? label}>{label}</button>)}</div>}
    <div className="keypad">{basicKeys.map(value => <button key={value} className={`key ${value === '=' ? 'equals' : ['÷','×','−','+'].includes(value) ? 'operator' : ['AC','±','%','backspace'].includes(value) ? 'utility' : ''}`} onMouseDown={event => event.preventDefault()} onClick={() => press(value)} aria-label={({ AC: 'Clear all', '±': 'Toggle positive or negative', '%': 'Percentage', '÷': 'Divide', '×': 'Multiply', '−': 'Subtract', '+': 'Add', '=': 'Equals', backspace: 'Backspace' } as Record<string, string>)[value] ?? value}>{value === 'backspace' ? <Icon name="backspace" size={23}/> : value}</button>)}</div>
    <div className="calculator-footnote"><span className="tiny-dot"/>Percentage divides a value by 100. Try 200 × 15%.</div>
  </section>;
}

function Converter({ currency }: { currency: boolean }) {
  const [categoryId, setCategoryId] = useState('length');
  const category = categories.find(c => c.id === categoryId)!;
  const [from, setFrom] = useState(currency ? 'USD' : 'm');
  const [to, setTo] = useState(currency ? 'EUR' : 'km');
  const [input, setInput] = useState('1');
  const options = currency ? currencies.map(c => ({ id: c.id, name: `${c.id} — ${c.name}`, symbol: c.id })) : category.units;
  const fromOptions = options.filter(option => !currency || option.id !== to);
  const toOptions = options.filter(option => !currency || option.id !== from);
  const fromUnit = options.find(u => u.id === from)!;
  const toUnit = options.find(u => u.id === to)!;
  let result: number | null = null;
  let error = '';
  try { const value = parseValue(input); result = currency ? convertCurrency(value, from, to) : convertUnit(value, categoryId, from, to); }
  catch (failure) { error = (failure as Error).message; }
  const prefix = currency ? 'currency' : 'unit';
  return <section className="converter-card" aria-label={currency ? 'Currency converter' : 'Unit converter'}>
    <div className="converter-header"><span><Icon name={currency ? 'currency' : 'units'}/>{currency ? 'Currency exchange' : 'Find your equivalent'}</span><span className="small-badge">{currency ? 'STATIC RATES' : 'INSTANT CONVERSION'}</span></div>
    {!currency && <div className="category-section"><label htmlFor="category-select">What are you converting?</label><select id="category-select" value={categoryId} onChange={event => { const next = categories.find(c => c.id === event.target.value)!; setCategoryId(next.id); setFrom(next.units[0].id); setTo(next.units[1].id); }}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="category-tags">{categories.slice(0, 5).map(c => <button key={c.id} aria-pressed={categoryId === c.id} className={categoryId === c.id ? 'selected' : ''} onClick={() => { setCategoryId(c.id); setFrom(c.units[0].id); setTo(c.units[1].id); }}><span>{c.icon}</span>{c.name}</button>)}</div></div>}
    {currency && <div className="rate-notice"><span className="notice-dot"/><p><strong>Static reference rates</strong>Fixed demonstration values, not live market rates.</p></div>}
    <div className="conversion-fields"><label htmlFor={`${prefix}-value`}>{currency ? 'Amount' : 'Value to convert'}</label><div className="value-input"><input id={`${prefix}-value`} type="text" inputMode="decimal" value={input} maxLength={40} onChange={event => setInput(event.target.value)} aria-invalid={!!error} aria-describedby={`${prefix}-result`}/><span>{fromUnit.symbol}</span></div><div className="unit-selectors"><div><label htmlFor={`${prefix}-from`}>From</label><select id={`${prefix}-from`} value={from} onChange={event => { if (!currency || event.target.value !== to) setFrom(event.target.value); }}>{fromOptions.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><button className="swap-button" aria-label={currency ? 'Swap currencies' : 'Swap units'} title={currency ? 'Swap currencies' : 'Swap units'} onClick={() => { setFrom(to); setTo(from); }}><Icon name="swap" size={21}/></button><div><label htmlFor={`${prefix}-to`}>To</label><select id={`${prefix}-to`} value={to} onChange={event => { if (!currency || event.target.value !== from) setTo(event.target.value); }}>{toOptions.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div></div></div>
    <div className={`conversion-result ${error ? 'result-error' : ''}`} id={`${prefix}-result`} aria-live="polite"><span className="eyebrow">{error ? 'LET’S CHECK THAT VALUE' : 'YOUR CONVERSION'}</span>{error ? <p role="alert">{error}</p> : <><div className="result-number">{currency ? <bdi>{formatCurrencyAmount(result!, to)}</bdi> : <>{formatNumber(result!)}<span>{toUnit.symbol}</span></>}</div><div className="result-equation">{input} {fromUnit.symbol} = {formatNumber(result!)} {toUnit.symbol}</div></>}</div>
    {currency ? <section className="unit-references" aria-label="Fixed demo reference rates"><ul>{getCurrencyReferences(from, to).map(reference => <li key={reference}>{reference}</li>)}</ul></section> : <section className="unit-references" aria-label={`${category.name} reference conversions`}><ul>{getUnitReferences(categoryId).map(reference => <li key={reference}>{reference}</li>)}</ul></section>}
  </section>;
}





