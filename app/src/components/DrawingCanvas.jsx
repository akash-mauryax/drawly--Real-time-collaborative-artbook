import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-toastify';

const DrawingCanvas = () => {
  const { roomId } = useParams();
  const canvasRef = useRef(null)
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('freeDrawing');
  const serverUrl = import.meta.env.VITE_SERVER_URL
    || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://drawly-1.onrender.com');
  const socket = useRef(io(serverUrl)).current;
  const [shareLink, setShareLink] = useState('');
  const [userId] = useState(uuidv4());
  const [userName, setUserName] = useState('guest1');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const width = 900;
    const height = 600;

    canvas.width = width * 2
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2)
    context.lineCap = 'round';
    contextRef.current = context;



    socket.emit('joinRoom', { roomId, userId })

    socket.on('initialData', (data) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      data.forEach(({ x0, y0, x1, y1, color, size, tool }) => {
        context.strokeStyle = color;
        context.lineWidth = size;
        context.beginPath();
        if (tool === 'rectangle') {
          context.rect(x0, y0, x1 - x0, y1 - y0);

        } else if (tool === 'circle') {
          context.arc(x0, y0, Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), 0, 2 * Math.PI)
        }
        else if (tool === 'rhombus') {
          const midX = (x0 + x1) / 2;
          const midY = (y0 + y1) / 2;

          context.beginPath();
          context.moveTo(midX, y0);
          context.lineTo(x1, midY);
          context.lineTo(midX, y1);
          context.lineTo(x0, midY);
          context.closePath();
        }
        else if (tool === 'arrow') {
          const angle = Math.atan2(y1 - y0, x1 - x0);
          const headlen = 10; // length of the arrowhead

          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);

          // Arrowhead
          context.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 6),
            y1 - headlen * Math.sin(angle - Math.PI / 6));
          context.moveTo(x1, y1);
          context.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 6),
            y1 - headlen * Math.sin(angle + Math.PI / 6));
        }

        else {
          context.moveTo(x0, y0)
          context.lineTo(x1, y1)
        }
        context.stroke();
        context.closePath()
      })
    })

    socket.on('draw', ({ x0, y0, x1, y1, color, size, tool }) => {
      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      if (tool === 'rectangle') {
        context.rect(x0, y0, x1 - x0, y1 - y0);
      } else if (tool === 'circle') {
        context.arc(x0, y0, Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), 0, 2 * Math.PI)
      }
      else if (tool === 'rhombus') {
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;

        context.beginPath();
        context.moveTo(midX, y0);
        context.lineTo(x1, midY);
        context.lineTo(midX, y1);
        context.lineTo(x0, midY);
        context.closePath();
      }
      else if (tool === 'arrow') {
        const angle = Math.atan2(y1 - y0, x1 - x0);
        const headlen = 10; // length of the arrowhead

        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);

        // Arrowhead
        context.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 6),
          y1 - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(x1, y1);
        context.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 6),
          y1 - headlen * Math.sin(angle + Math.PI / 6));
      }

      else {
        context.moveTo(x0, y0)
        context.lineTo(x1, y1)
      }
      context.stroke()
      context.closePath()
    })

    socket.on('clearCanvas', () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
    })

    socket.on('toolChange', ({ tool, value }) => {
      if (tool === 'color') {
        setColor(value)
      } else if (tool === 'brushSize') {
        setBrushSize(value)
      } else {
        setTool(value)
      }
    })
    socket.on('chatHistory', (messages) => {
      setChatMessages(messages);
    })
    socket.on('assignedUserName', (assignedName) => {
      setUserName(assignedName);
    })
    socket.on('chatMessage', (message) => {
      setChatMessages((messages) => [...messages, message].slice(-100));
    })
    socket.on('chatCleared', () => {
      setChatMessages([]);
    })
    return () => {
      socket.off('draw')
      socket.off('initialData')
      socket.off('clearCanvas')
      socket.off('toolChange')
      socket.off('chatHistory')
      socket.off('assignedUserName')
      socket.off('chatMessage')
      socket.off('chatCleared')
    }



  }, [roomId, socket, userId])

  useEffect(() => {
    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [chatMessages])

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.moveTo(offsetX, offsetY);
    contextRef.current.currentPosition = { x0: offsetX, y0: offsetY };
    setIsDrawing(true)
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.currentPosition.endPosition = { offsetX, offsetY }

    if (tool === 'freeDrawing' || tool === 'eraser') {
      const { x0, y0 } = contextRef.current.currentPosition;

      const context = contextRef.current;
      context.beginPath(); // Start a new path
      context.moveTo(x0, y0);
      context.lineTo(offsetX, offsetY);
      context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      context.lineWidth = brushSize;
      context.stroke();
      context.closePath(); // End the path

      socket.emit('draw', {
        roomId,
        userId,
        x0,
        y0,
        x1: offsetX,
        y1: offsetY,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        size: brushSize,
        tool: tool,
      });

      context.currentPosition = { x0: offsetX, y0: offsetY };
    }

  }
  const finishDrawing = () => {
    if (!isDrawing) return;
    if (!contextRef.current.currentPosition) return
    const { x0, y0 } = contextRef.current.currentPosition;
    const { offsetX, offsetY } = contextRef.current.currentPosition.endPosition || { offsetX: x0, offsetY: y0 }

    if (['rectangle', 'circle', 'rhombus', 'arrow'].includes(tool)) {
      contextRef.current.beginPath();
      if (tool === 'rectangle') {
        contextRef.current.rect(x0, y0, offsetX - x0, offsetY - y0)

      } else if (tool === 'circle') {
        contextRef.current.arc(x0, y0, Math.sqrt(Math.pow(offsetX - x0, 2) + Math.pow(offsetY - y0, 2)), 0, 2 * Math.PI);
      }
      else if (tool === 'rhombus') {
        const midX = (x0 + offsetX) / 2;
        const midY = (y0 + offsetY) / 2;

        contextRef.current.moveTo(midX, y0);
        contextRef.current.lineTo(offsetX, midY);
        contextRef.current.lineTo(midX, offsetY);
        contextRef.current.lineTo(x0, midY);
        contextRef.current.closePath();
      } else if (tool === 'arrow') {
        const angle = Math.atan2(offsetY - y0, offsetX - x0);
        const headlen = 10;

        contextRef.current.moveTo(x0, y0);
        contextRef.current.lineTo(offsetX, offsetY);

        contextRef.current.lineTo(offsetX - headlen * Math.cos(angle - Math.PI / 6),
          offsetY - headlen * Math.sin(angle - Math.PI / 6));
        contextRef.current.moveTo(offsetX, offsetY);
        contextRef.current.lineTo(offsetX - headlen * Math.cos(angle + Math.PI / 6),
          offsetY - headlen * Math.sin(angle + Math.PI / 6));
      }


      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize
      contextRef.current.stroke();
      contextRef.current.closePath()


      socket.emit('draw', {
        roomId,
        userId,
        x0,
        y0,
        x1: offsetX,
        y1: offsetY,
        color: color,
        size: brushSize,
        tool: tool
      })
    }
    setIsDrawing(false);
    contextRef.current.currentPosition = null
  }

  const undoCanvas = () => {
    console.log('Undo button clicked');
    socket.emit('undoCanvas', roomId);
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    socket.emit('clearCanvas', roomId)

  }


  const handleToolChange = (tool, value) => {
    if (tool === 'color') {
      setColor(value)
    } else if (tool === 'brushSize') {
      setBrushSize(value)
    }
    else {
      setTool(value)
    }
    socket.emit('toolChange', { roomId, tool, value })
  }
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        toast.success('Link copied to clipboard!', {
          position: 'top-right',
          autoClose: 3000,
        });
      })
      .catch(() => {
        toast.error('Failed to copy the link', {
          position: 'top-right',
          autoClose: 3000,
        });
      });
  }
  const sendChatMessage = (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message) return;

    socket.emit('sendChatMessage', {
      roomId,
      userId,
      message
    });
    setChatInput('');
  }
  const clearChat = () => {
    if (chatMessages.length === 0 || !window.confirm('Clear this chat for everyone in the room?')) {
      return;
    }

    socket.emit('clearChat', roomId);
  }
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    setShareLink(`${window.location.origin}${basePath}/draw/${roomId}`)
  }, [roomId])
  return (
    <div className='container'>
      <div className='workspace'>
        <canvas
          className='canvas'
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
          ref={canvasRef}
        />
        <aside className='chat-panel' aria-label="Room chat">
          <div className='chat-header'>
            <div>
              <h2>Room chat</h2>
              <p>Chat with the people in this drawing room · You are {userName}</p>
            </div>
            <div className='chat-header-actions'>
              <span className='chat-room-id'>#{roomId?.slice(0, 6)}</span>
              <button className='clear-chat-button' type="button" onClick={clearChat} disabled={chatMessages.length === 0}>
                Clear chat
              </button>
            </div>
          </div>
          <div className='chat-messages' ref={chatMessagesRef} aria-live="polite">
            {chatMessages.length === 0 ? (
              <p className='chat-empty'>No messages yet. Say hello!</p>
            ) : (
              chatMessages.map((chatMessage) => (
                <div
                  className={`chat-message ${chatMessage.userId === userId ? 'chat-message-own' : ''}`}
                  key={chatMessage.id}
                >
                  <div className='chat-message-meta'>
                    <strong>{chatMessage.userId === userId ? 'You' : chatMessage.userName}</strong>
                    <span>{new Date(chatMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p>{chatMessage.message}</p>
                </div>
              ))
            )}
          </div>
          <form className='chat-form' onSubmit={sendChatMessage}>
            <label className='sr-only' htmlFor="chat-message">Message</label>
            <input
              id="chat-message"
              type="text"
              value={chatInput}
              maxLength={500}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Write a message..."
              autoComplete="off"
            />
            <button type="submit" disabled={!chatInput.trim()}>Send</button>
          </form>
        </aside>
      </div>
      <div className='controls'>
        <label htmlFor="color">Color:</label>
        <input
          id="color"
          type="color"
          value={color}
          onChange={(e) => handleToolChange('color', e.target.value)}
        />
        <label htmlFor="brushSize">Brush Size:</label>
        <input
          id="brushSize"
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => handleToolChange('brushSize', e.target.value)}
        ></input>
        <label htmlFor="tool">Tool:</label>
        <select id="tool" value={tool} onChange={(e) => handleToolChange('tool', e.target.value)}>
          <option value="eraser">Eraser</option>
          <option value="freeDrawing">Free Drawing</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="rhombus">Rhombus</option>
          <option value="arrow">Arrow</option>
        </select>
        <button onClick={undoCanvas}>Undo</button>
        <button onClick={clearCanvas}>Clear Canvas</button>
        <div>
          <button onClick={copyToClipboard}>Share This Drawing</button>
          <p>Share this link with others:</p>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      </div>

    </div>
  )
}

export default DrawingCanvas
