import React, { useEffect, useState } from 'react'
import assets from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup'

const Message = ({ message }) => {

  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  const [copied, setCopied] = useState(false)
  const [previewImage, setPreviewImage] = useState(null) // ✅ modal state

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ✅ Safe Copy Image
  const copyImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
    } catch (error) {
      console.error("Copy failed", error)
    }
  }

  // ✅ Proper Download (no redirect)
  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `generated-${Date.now()}.png`

      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(blobUrl)

    } catch (error) {
      console.error("Download failed", error)
    }
  }

  return (
    <div>

      {/* USER MESSAGE */}
      {message.role === "user" ? (

        <div className='flex items-start justify-end my-4 gap-2'>

          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F] rounded-md max-w-2xl'>
            <p className='text-sm dark:text-primary'>
              {message.content}
            </p>

            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
              {moment(message.timestamp).fromNow()}
            </span>
          </div>

          <img
            src={assets.user_icon}
            alt=''
            className='w-8 rounded-full'
          />

        </div>

      ) : (

        /* AI MESSAGE */
        <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4'>

          {message.isImage ? (

            <div className="flex flex-col gap-2 mt-2">

              {/* ✅ Click to open modal */}
              <img
                src={message.content}
                alt=''
                onClick={() => setPreviewImage(message.content)}
                className='w-full max-w-md rounded-md cursor-pointer hover:scale-105 transition'
              />

              {/* Actions */}
              <div className="flex gap-2">

                <button
                  onClick={() => copyImage(message.content)}
                  className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Copy Image
                </button>

                <button
                  onClick={() => downloadImage(message.content)}
                  className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Download
                </button>

              </div>

            </div>

          ) : (

            <div className='text-sm dark:text-primary reset-tw'>

              <Markdown
                components={{
                  code({ inline, className, children }) {

                    const codeText = String(children)

                    if (!inline) {
                      return (
                        <div className="relative">

                          <button
                            onClick={() => copyToClipboard(codeText)}
                            className="absolute right-2 top-2 text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            {copied ? "Copied" : "Copy"}
                          </button>

                          <pre className="overflow-x-auto bg-[#1e1b2e] text-gray-200 p-4 rounded-lg my-2">
                            <code className={className}>
                              {children}
                            </code>
                          </pre>

                        </div>
                      )
                    }

                    return (
                      <code className="bg-gray-200 px-1 rounded">
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </Markdown>

            </div>

          )}

          <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
            {moment(message.timestamp).fromNow()}
          </span>

        </div>

      )}

      {/* ✅ IMAGE MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white text-xl"
            >
              ✕
            </button>

            {/* Image */}
            <img
              src={previewImage}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Actions */}
            <div className="flex justify-between mt-3">

              <button
                onClick={() => copyImage(previewImage)}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                Copy
              </button>

              <button
                onClick={() => downloadImage(previewImage)}
                className="bg-white text-black px-3 py-1 rounded"
              >
                Download
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Message