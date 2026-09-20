import { useState } from 'react'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import DrawingCanvas from './components/DrawingCanvas'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const[roomId,setRoomId]=useState('');
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

  const createRoom=() =>{
    const newRoomId=Math.random().toString(36).substring(2,15);
    setRoomId(newRoomId)
    window.location.href=`${basePath}/draw/${newRoomId}`;
  }
  const router=createBrowserRouter([
    {
      path:'/',
      element:(
        <div className='app-container'>
          <h1>Onine-Drawing App</h1>
        {roomId ? (
          <DrawingCanvas/>
        ):(
          <div>
            <button onClick={createRoom}>Create New Drawing Room</button>
            <p className='drawing-room-message'>Create  a new room to start drawing app</p>
         
          </div>
        )}
        </div>
      
      )
    },
    {
      path:'/draw/:roomId',
      element:<DrawingCanvas/>
    }
  ], { basename: basePath })
  return (
    <>
        <RouterProvider router={router}/>
        <ToastContainer position="top-center" autoClose={3000} />
    </>
  )
}

export default App
