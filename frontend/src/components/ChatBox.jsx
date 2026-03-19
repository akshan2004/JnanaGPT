import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import assets from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const containerRef = useRef(null)

  const { selectedChat, user, axios, token } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [promt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!user) return toast('Login to send message')
    if (!selectedChat) return toast.error('Please select a chat')
    if (!promt.trim()) return

    try {
      setLoading(true)

      const promptCopy = promt.trim()
      setPrompt('')

      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: promptCopy,
          timestamp: Date.now(),
          isImage: false
        }
      ])

      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished
        },
        {
          headers: { Authorization: token }
        }
      )

      if (data.success) {
        setMessages(prev => [...prev, data.reply])
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || [])
    }
  }, [selectedChat])

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div className='flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full px-4 md:px-10 py-6'>

      {/* Chat Area */}
      <div
        ref={containerRef}
        className='flex-1 overflow-y-auto space-y-4 pr-2'
      >

        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center text-center'>

            <img
              src={assets.logo_full}
              alt="JnanaGPT"
              className="w-52 opacity-80"
            />

            <p className='mt-6 text-3xl font-medium text-gray-400'>
              Ask me anything...
            </p>

          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {loading && (
          <div className='flex gap-2'>
            <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
            <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
            <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
          </div>
        )}

      </div>

      {/* Image toggle */}
      {mode === 'image' && (
        <label className='flex items-center gap-2 text-sm mx-auto mt-2 text-gray-500'>
          <input
            type='checkbox'
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publish to community
        </label>
      )}

      {/* Input Box */}
      <form
        onSubmit={onSubmit}
        className='mt-4 backdrop-blur-lg bg-white/70 dark:bg-[#2a1f3d]/60 border border-gray-300 dark:border-[#80609F]/30 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3'
      >

        {/* Toggle */}
        <div className="flex bg-gray-200 dark:bg-[#2a1f3d] rounded-full p-1">

          <button
            type="button"
            onClick={() => setMode("text")}
            className={`px-3 py-1 text-sm rounded-full cursor-pointer transition ${
              mode === "text"
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3a2a55]"
            }`}
          >
            Text
          </button>

          <button
            type="button"
            onClick={() => setMode("image")}
            className={`px-3 py-1 text-sm rounded-full cursor-pointer transition ${
              mode === "image"
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#3a2a55]"
            }`}
          >
            Image
          </button>

        </div>

        {/* Input */}
        <input
          value={promt}
          onChange={(e) => setPrompt(e.target.value)}
          type='text'
          placeholder='Ask anything...'
          className='flex-1 bg-transparent outline-none text-sm'
          disabled={loading}
        />

        {/* Send */}
        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className='w-8 cursor-pointer hover:scale-110 transition'
            alt=''
          />
        </button>

      </form>

    </div>
  )
}

export default ChatBox