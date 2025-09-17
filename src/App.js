import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { animated, useSpring } from "@react-spring/web";

// 全局样式
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding: 20px;
  }
`;

// 样式组件
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  text-align: center;

  h1 {
    font-size: 2.2em;
    margin-bottom: 10px;
  }

  p {
    opacity: 0.9;
    font-size: 1.1em;
  }
`;

const Controls = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const ControlGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #495057;
  }

  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #dee2e6;
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }

    &::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
    }
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 12px;
  background: ${(props) => (props.highlight ? "#e7f5ff" : "#f8f9fa")};
  border-radius: 8px;
  border: 1px solid ${(props) => (props.highlight ? "#339af0" : "#e9ecef")};

  h3 {
    font-size: 0.9em;
    color: #868e96;
    margin-bottom: 5px;
  }

  p {
    font-size: 1.3em;
    font-weight: bold;
    color: #495057;
  }
`;

const GameArea = styled.div`
  padding: 30px;
  position: relative;
`;

const ConveyorBelt = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(to bottom, #e9ecef, #dee2e6);
  border: 3px solid #adb5bd;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
`;

const TargetMarker = styled.div`
  position: absolute;
  top: 0;
  left: 80%;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, transparent, #ff6b6b, transparent);
  z-index: 1;

  &::after {
    content: "目标位置: 100cm";
    position: absolute;
    top: 10px;
    left: 10px;
    background: #ff6b6b;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: bold;
  }
`;

const CargoBox = styled(animated.div)`
  position: absolute;
  bottom: 50px;
  width: 70px;
  height: 50px;
  background: linear-gradient(135deg, #8b4513 0%, #6d2c0c 100%);
  border: 2px solid #5a1f09;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9em;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const Buttons = styled.div`
  display: flex;
  gap: 15px;
  padding: 20px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.start {
    background: linear-gradient(135deg, #51cf66 0%, #2f9e44 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(79, 207, 106, 0.4);
    }
  }

  &.reset {
    background: linear-gradient(135deg, #ff8787 0%, #fa5252 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 135, 135, 0.4);
    }
  }
`;

const Lesson = styled.div`
  padding: 25px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;

  h3 {
    color: #495057;
    margin-bottom: 15px;
    font-size: 1.3em;
  }

  ul {
    list-style: none;

    li {
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
      color: #666;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: "💡";
        margin-right: 10px;
        font-size: 1.2em;
      }
    }
  }
`;

// 主游戏组件
const PControlGame = () => {
  const [gameState, setGameState] = useState({
    position: 30,
    error: 70,
    isRunning: false,
    pGain: 0.8,
    overshoot: 0,
    oscillations: 0,
  });

  const [oscillationCount, setOscillationCount] = useState(0);
  const [hasOvershot, setHasOvershot] = useState(false);

  // 使用react-spring创建平滑动画
  const animation = useSpring({
    left: `${gameState.position}%`,
    config: {
      tension: 100 + gameState.pGain * 50,
      friction: 10 + gameState.pGain * 5,
    },
  });

  // 游戏循环
  useEffect(() => {
    let gameInterval;
    let lastPosition = gameState.position;
    let crossingCount = 0;

    if (gameState.isRunning) {
      gameInterval = setInterval(() => {
        setGameState((prevState) => {
          const error = 100 - prevState.position;
          const movement = prevState.pGain * error;

          let newPosition = prevState.position + movement;

          // 检测震荡（越过目标点）
          if (
            (lastPosition < 100 && newPosition >= 100) ||
            (lastPosition > 100 && newPosition <= 100)
          ) {
            crossingCount++;
            setOscillationCount((prev) => prev + 1);
          }

          // 检测超调（超过目标点）
          if (newPosition > 100 && !hasOvershot) {
            setHasOvershot(true);
          }

          lastPosition = newPosition;

          // 限制在0-100范围内
          newPosition = Math.max(0, Math.min(100, newPosition));

          const newError = 100 - newPosition;

          return {
            ...prevState,
            position: newPosition,
            error: newError,
            oscillations: crossingCount,
            overshoot: hasOvershot ? Math.max(0, newPosition - 100) : 0,
          };
        });
      }, 100);
    }

    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [gameState.isRunning, gameState.pGain, hasOvershot]);

  const handleStart = () => {
    setGameState((prev) => ({ ...prev, isRunning: true }));
  };

  const handleReset = () => {
    setGameState({
      position: 30,
      error: 70,
      isRunning: false,
      pGain: 0.8,
      overshoot: 0,
      oscillations: 0,
    });
    setOscillationCount(0);
    setHasOvershot(false);
  };

  const handlePGainChange = (event) => {
    setGameState((prev) => ({
      ...prev,
      pGain: parseFloat(event.target.value),
    }));
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <h1>PID控制教学游戏：比例控制（P）</h1>
          <p>通过互动体验理解比例控制的特性和局限性</p>
        </Header>

        <Controls>
          <ControlGroup>
            <label htmlFor="pGain">
              P参数调节: {gameState.pGain.toFixed(2)}
            </label>
            <input
              id="pGain"
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={gameState.pGain}
              onChange={handlePGainChange}
              disabled={gameState.isRunning}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9em",
                color: "#868e96",
                marginTop: "5px",
              }}
            >
              <span>慢速 (0.1)</span>
              <span>快速 (2.0)</span>
            </div>
          </ControlGroup>
        </Controls>

        <Stats>
          <StatItem>
            <h3>当前位置</h3>
            <p>{gameState.position.toFixed(1)} cm</p>
          </StatItem>
          <StatItem highlight={true}>
            <h3>当前误差</h3>
            <p>{Math.abs(gameState.error).toFixed(1)} cm</p>
          </StatItem>
          <StatItem>
            <h3>震荡次数</h3>
            <p>{oscillationCount}</p>
          </StatItem>
        </Stats>

        <GameArea>
          <ConveyorBelt>
            <TargetMarker />
            <CargoBox style={animation}>可可豆</CargoBox>
          </ConveyorBelt>
        </GameArea>

        <Buttons>
          <Button
            className="start"
            onClick={handleStart}
            disabled={gameState.isRunning}
          >
            {gameState.isRunning ? "运行中..." : "启动传送带"}
          </Button>
          <Button className="reset" onClick={handleReset}>
            重置系统
          </Button>
        </Buttons>

        <Lesson>
          <h3>📚 学习观察要点</h3>
          <ul>
            <li>
              <strong>P值大小的影响：</strong>
              尝试调整P参数，观察箱子移动速度和震荡情况。小P值移动缓慢，大P值移动快速但震荡强烈。
            </li>
            <li>
              <strong>稳态误差：</strong>
              注意箱子是否能够完全到达100cm位置？为什么总是差一点点？
            </li>
            <li>
              <strong>超调与震荡：</strong>
              观察当P值较大时，箱子是否会超过目标位置然后来回震荡？
            </li>
            <li>
              <strong>思考：</strong>
              这个现象说明了比例控制(P)有什么局限性？如何解决这个问题？
            </li>
          </ul>
        </Lesson>
      </Container>
    </>
  );
};

export default PControlGame;
