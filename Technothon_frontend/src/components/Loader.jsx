import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinnerContainer min-h-screen inset-0 z-50 items-center justify-center bg-[#1d1b1b]">
        <div className="spinner" />
        <div className="loader">
          <div className="words">
            <span className="word poppins">Technothon</span>
            <span className="word poppins">IoT Exposition</span>
            <span className="word poppins">AI Unleashed</span>
            <span className="word poppins">TIU</span>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .spinnerContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .spinner {
    width: 100px;
    height: 100px;
    display: grid;
    border: 4px solid #0000;
    border-radius: 50%;
    border-right-color: blue;
    animation: tri-spinner 0.5s infinite linear;
  }

  .spinner::before,
  .spinner::after {
    content: "";
    grid-area: 1/1;
    margin: 2px;
    border: inherit;
    border-radius: 50%;
    animation: tri-spinner 2s infinite;
  }

  .spinner::after {
    margin: 8px;
    animation-duration: 3s;
  }

  @keyframes tri-spinner {
    100% {
      transform: rotate(1turn);
    }
  }

  /* Words only */
  .words {
    position: relative;
    height: 90px;         /* one word visible at a time */
    overflow: hidden;
    margin-top: 10px;
    font-family: "Poppins", sans-serif;
    font-weight: 600;
    font-size: 28px;
    color: #ffffff;
    text-align: center;
  }

  .word {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;  /* match container height */
  }

  .words .word {
    animation: cycle-words 3s infinite;
  }

  @keyframes cycle-words {
    0%, 15%   { transform: translateY(0%); }
    20%, 35%  { transform: translateY(-100%); }
    40%, 55%  { transform: translateY(-200%); }
    60%, 75%  { transform: translateY(-300%); }
    80%, 100% { transform: translateY(-400%); }
  }
`;


export default Loader;