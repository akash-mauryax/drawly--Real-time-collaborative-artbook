# 🎨 Drawly – Real-Time Collaborative Artboard

> A real-time collaborative drawing platform where multiple users can draw, communicate, and work together on the same digital canvas.

🌐 **Live Demo:**  
https://akash-mauryax.github.io/drawly--Real-time-collaborative-artbook/

📂 **GitHub Repository:**  
https://github.com/akash-mauryax/drawly--Real-time-collaborative-artbook

---

## 📌 Overview

**Drawly** is a real-time collaborative digital artboard that allows multiple users to join the same drawing room and work together on a shared canvas.

Users can create drawings using different drawing tools while simultaneously communicating through an integrated **live room chat**.

Each drawing room has a unique shareable URL, making it easy to invite other users and collaborate remotely.

---

## ✨ Features

### 🎨 Collaborative Drawing

- Real-time shared drawing canvas
- Freehand drawing
- Adjustable brush size
- Custom drawing colors
- Drawing tool selection
- Eraser / additional drawing tools
- Undo functionality
- Clear canvas functionality
- Smooth canvas interaction

### ⚡ Real-Time Collaboration

- Multiple users can join the same drawing room
- Drawing changes are synchronized between users
- Unique room-based collaboration
- Shareable drawing-room URL
- Collaborate from different devices

### 💬 Live Room Chat

Drawly also includes an integrated **real-time chat panel** for each drawing room.

Users can:

- Send messages while drawing
- Communicate with other collaborators
- See messages from users in the same room
- Identify the current drawing room
- Clear the room chat when required

This allows users to **draw and communicate without leaving the application**.

### 🔗 Share Drawing

Each drawing session has a unique room URL.

Example:

https://akash-mauryax.github.io/drawly--Real-time-collaborative-artbook/#/draw/ROOM_ID

Users can simply copy and share the room link with other collaborators.

---

## 🖥️ Application Interface

The application consists of three major sections:

### 1. 🖼️ Drawing Canvas

The main workspace where users create and edit their drawings.

### 2. 💬 Room Chat

A live communication panel connected to the current drawing room.

### 3. 🛠️ Drawing Controls

The toolbar provides controls for:

- Color
- Brush Size
- Drawing Tools
- Undo
- Clear Canvas
- Share Drawing

---

## 🏗️ System Architecture

```text
                  ┌───────────────────────┐
                  │       User 1          │
                  │                       │
                  │  Drawing + Chat       │
                  └───────────┬───────────┘
                              │
                              │ Real-Time Events
                              ▼
                  ┌───────────────────────┐
                  │   Real-Time Server    │
                  │                       │
                  │  Room Management      │
                  │  Drawing Sync         │
                  │  Chat Sync            │
                  └───────────┬───────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
       ┌─────────────────┐        ┌─────────────────┐
       │     User 2      │        │     User 3      │
       │                 │        │                 │
       │ Drawing + Chat  │        │ Drawing + Chat  │
       └─────────────────┘        └─────────────────┘
