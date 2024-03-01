import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './App.scss';

const Pomodoro = () => {
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [time, setTime] = useState(sessionLength * 60 * 1000);
  const [type, setType] = useState('Session');
  const [paused, setPaused] = useState(true);
  const [sessionChanged, setSessionChanged] = useState(false);
  const [timer, setTimer] = useState(null);

  const breakOperation = operator => {
    if (operator === '-') {
      setBreakLength(prevLength => Math.max(prevLength - 1, 1));
    } else {
      setBreakLength(prevLength => Math.min(prevLength + 1, 60));
    }
  };

  const sessionOperation = operator => {
    if (operator === '-') {
      setSessionLength(prevLength => Math.max(prevLength - 1, 1));
    } else {
      setSessionLength(prevLength => Math.min(prevLength + 1, 60));
    }
    setSessionChanged(true);
    setTime(prevLength => (prevLength < 60000 ? prevLength : sessionLength * 60 * 1000));
  };

  const interval = () => {
    const newTimer = setInterval(() => {
      setTime(prevTime => Math.max(prevTime - 1000, 0));
    }, 1000);
    setTimer(newTimer);
    setPaused(false);
  };

  const startAndPause = () => {
    if (paused) {
      let newTimer;
      if (sessionChanged && type === 'Session') {
        setTime(sessionLength * 60 * 1000);
        setSessionChanged(false);
        newTimer = interval();
      } else {
        newTimer = interval();
      }
      return () => clearInterval(newTimer); // Membersihkan timer saat komponen di-unmount atau di-render ulang
    } else {
      setPaused(true);
    }
  };

  const getTime = time => {
    const duration = moment.duration(time);
    const minutes = duration.minutes().toString().padStart(2, '0');
    const seconds = duration.seconds().toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const reset = () => {
    clearInterval(timer);
    setPaused(true);
    const alarm = document.getElementById('beep');
    alarm.pause();
    alarm.currentTime = 0;
    setBreakLength(5);
    setSessionLength(25);
    setTime(25 * 60 * 1000);
    setType('Session');
    setSessionChanged(false);
  };

  useEffect(() => {
    const alarm = document.getElementById('beep');
    if (time === 0 && type === 'Session') {
      alarm.play();
      setType('Break');
      setTime(breakLength * 60 * 1000);
      setPaused(true);
    } else if (time === 0 && type === 'Break') {
      alarm.play();
      setType('Session');
      setTime(sessionLength * 60 * 1000);
      setPaused(true);
    }
    return () => {
      clearInterval(timer);
    };
  }, [time, type, breakLength, sessionLength]);

  return (
    <div className="container">
      <div className="pomodoro">
        <h1>Pomodoro</h1>
        <div className="controles">
          <div className="break-group">
            <label id="break-label">Break Length</label>
            <button id="break-decrement" onClick={() => breakOperation('-')}>
              --
            </button>
            <p id="break-length">{breakLength}</p>
            <button id="break-increment" onClick={() => breakOperation('+')}>
              ++
            </button>
          </div>
          <div className="session-group">
            <label id="session-label">Session Length</label>
            <button id="session-decrement" onClick={() => sessionOperation('-')}>
              --
            </button>
            <p id="session-length">{sessionLength}</p>
            <button id="session-increment" onClick={() => sessionOperation('+')}>
              ++
            </button>
          </div>
        </div>
        <div className="timer">
          <label id="timer-label">{type}</label>
          <p id="time-left">{getTime(time)}</p>
        </div>
        <div className="bottom-btns">
          <button id="start_stop" onClick={startAndPause}>
            {paused ? 'Start' : 'Pause'}
          </button>
          <button id="reset" onClick={reset}>
            Reset
          </button>
        </div>
        <audio id="beep" preload="auto">
          <source src="http://soundbible.com/mp3/Pager%20Beeps-SoundBible.com-260751720.mp3" type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default Pomodoro;